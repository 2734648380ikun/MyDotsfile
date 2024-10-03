(function (global, factory) {
      // 重写factory方法.让factory有独立的作用域
      var _factory = factory; factory = function(arkWeb, wasmoon) { return function(options) { return _factory(arkWeb, wasmoon)(options); }};
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@tencent/ark-web')) :
    typeof define === 'function' && define.amd ? define(['@tencent/ark-web'], factory) :
    (global.Ark = factory(global.WebArk));
})(this, (function (arkWeb) {
    /**
     * @fileoverview 前置脚本注入(polyfill)
     * @author alawnxu
     * @date 2022-07-30 22:20:00
     * @version 1.0.0
     * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
     * 
     * 在Ark引擎中默认支持了 JSON.Stringify 和 JSON.Parse @see {@link /Users/alawnxu/workspace/qq/Ark/src/libs/net/httpwrapper.cpp}
     * 其实同 Net.JSONToTable 和 Net.TableToJSON
     * 
     * 在这里就通过注入的方式注册进去吧
     * 
     * 涉及到这个Api的Ark. 游戏中心所有的Ark因为走了单独的构建,所以都会使用到这个Api
     * @see {@link https://git.woa.com/sq-gamecenter-frontend-team/gc-ark-hub/tree/master/com_tencent_gamecenter_game_download}
     * @see {@link https://git.woa.com/group-pro/bot-frontend/bot-ark/tree/master/com_tencent_bot_groupbot}
     */
    (function() {
        JSON.Stringify = JSON.Stringify || JSON.stringify;
        JSON.Parse = JSON.Parse || JSON.parse;
    })();

    /**
     * @fileoverview 前置脚本注入
     * @author alawnxu
     * @date 2022-04-09 23:26:29
     * @version 1.0.0
     * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
     */

    /**
     * 暴露出局部变量.方便后续的模块挂载
     */
    let GlobalAppTemplates = {};
    const ArkGlobalContext = {
      /**
       * @private
       * @param {string} id 视图ID
       * @param {string} template 视图模板
       */
      _setViewTemplate(id, template) {
        GlobalAppTemplates[id] = template;
      },
      /**
       * 获取所有的模板
       * @public
       * @returns
       */
      getViewTemplates() {
        return GlobalAppTemplates;
      },
      /**
       * 释放所有模板
       * @date 2022-08-08 11:14:36
       */
      clearTemplates() {
        GlobalAppTemplates = {};
      }
    };

    const ArkWindow = Object.create({});
        const apis = ["QQ","global","console","setTimeout","setInterval","clearInterval","clearTimeout","appVersion","hasEmoji","baseUrl","httpPost","getStoreKey","getItem","setItem","isPureObject","isFunction","generatePuin","replaceAllEmoji","ARK_SHARE_TYPE","createAssigner","has","isObject","allKeys","keys","UrlParser","util","http","JSON","report","BeaconAction","parseFeedComment","parseFeed","getEmojiUrl","getEmojiUnicode","parseEm","c2c","isPreview","isChannel","isAndroid","getAvatar","getDarkColorModel","getEasyModel","qun","preview","emoji","mockData","text","header","link","group","guild","record","comment","empty","commentItem","image","qunpro95","qun95","text95","header95","record95","comment95","commentItem95","image95","emoji95","extraLen","baseView","app"];
        apis.forEach(api => {
          let val;
          Object.defineProperty(ArkWindow, api, {
            get() {
              return val;
            },
            set(value) {
              val = value;
            }
          });
        });

    /**
     * @fileoverview 前置脚本注入
     * @author alawnxu
     * @date 2022-04-09 23:26:29
     * @version 1.0.0
     * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
     */

    const GlobalApplicationApis = {};
    ["CreateView","CreateRootView","GetRootView","GetTemplate","GetApplicationVersion","GetBizsrc"].forEach((method) => {
      GlobalApplicationApis[method] = function (...params) {
        const templates = ArkGlobalContext.getViewTemplates();

        /**
         * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
         * @update 2022年07月30日22:48:18
         * @author alawnxu
         */
        const application = new arkWeb.Application(ArkWindow, templates);
        if (typeof application[method] === 'function') {
          return application[method](...params);
        }

        console.warn('Application not implement method:', method);
      };
    });

    const { CreateView,CreateRootView,GetRootView,GetTemplate,GetApplicationVersion,GetBizsrc } = GlobalApplicationApis;

    /**
     * @fileoverview 前置脚本注入(UI模块)
     * @author alawnxu
     * @date 2022-04-09 23:26:29
     * @version 1.0.0
     * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
     */

    const UI = new Proxy(arkWeb.UI, {
      get(target, propKey) {
        const func = target[propKey];
        if (typeof func === 'function') {

          /**
           * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
           * @update 2022年07月30日22:48:18
           * @author alawnxu
           */
          return function (...params) {
            return target[propKey](...params, ArkWindow);
          };
        }
        return target[propKey];
      },
    });

    /**
     * @fileoverview 前置脚本注入(Net模块)
     * @author alawnxu
     * @date 2022-04-09 23:26:29
     * @version 1.0.0
     * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
     */

    const Net = new Proxy(arkWeb.Net, {
      get(target, propKey) {
        const func = target[propKey];
        if (typeof func === 'function') {

          /**
           * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
           * @update 2022年07月30日22:48:18
           * @author alawnxu
           */
          return function (...params) {
            return target[propKey](...params, ArkWindow);
          };
        }
        return target[propKey];
      },
    });

    /**
     * @fileoverview 前置脚本注入(Net模块)
     * @author alawnxu
     * @date 2022-04-09 23:26:29
     * @version 1.0.0
     * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
     */

    const QQ = new Proxy(arkWeb.QQ, {
      get(target, propKey) {
        const func = target[propKey];
        // 这里只DataRequest需要代理，其它key暂不需要，需要再加入即可
        if (typeof func === 'function' && propKey === 'DataRequest') {

          /**
           * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
           * @update 2022年07月30日22:48:18
           * @author alawnxu
           */
          return function (...params) {
            return target[propKey](...params, ArkWindow);
          };
        }
        return target[propKey];
      },
    });

    ArkGlobalContext._setViewTemplate('text95', `<View style="feed-wrap-95" id="feedWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
    <View style="feed-title-wrap-95" id="feedTitleWrap">
    </View>
    <View style="feed-content-95" id="feedContent">
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('qun95', `<View style="qun-feed-wrap-95" id="qun" metadatatype="detail" radius="8,8,8,8">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnMouseDown value="app.OnMouseDown" name="OnMouseDown"></OnMouseDown>
        <OnMouseUp value="app.OnMouseUp" name="OnMouseUp"></OnMouseUp>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="qun-feed-content-wrap-95" id="qunFeedContentWrap">
        <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
        <View style="qun-feed-header-95">
            <View style="qun-feed-header-left-95">
                <Image style="header-image-95" id="avatar" value="" stretch="1" visible="true" radius="4,4,4,4"></Image>
            </View>
            <View style="qun-feed-header-right-95">
                <Text id="guildName" style="qun-pro-nick-95" textcolor="0xFF999999" autosize="true" font="size.12" ellipsis="true" value="" align="4"></Text>
            </View>
        </View>
        <View style="qun-feed-title-wrap-95" id="qunFeedTitle">
        </View>
        <View style="qun-feed-text-95" id="qunFeedText">
        </View>
        <View style="qun-feed-emoji-record-95" id="qunFeedEmojiRecord">
        </View>
        <View style="qun-feed-image-wrap-95" visible="true" id="qunFeedImageWrap">
            <View style="qun-feed-image-95" id="qunFeedImage" radius="6,6,6,6">
                <Image id="qunFeedImageTexture" radius="6,6,6,6"></Image>
                <View style="qun-feed-img-empty-wrap-95" visible="false" id="qunFeedImageEmptyWrap" radius="2,2,2,2">
                    <Texture color="0xF5F8FCFF"></Texture>
                    <View style="qun-feed-img-empty-text-95" id="qunFeedImgEmptyText">
                    </View>
                </View>
            </View>
        </View>
         <View style="qun-foot-view-95" id="qunFeed95View">
            
            <View style="qun-foot-space-view-95" id="qunFootSpaceView">
                <Texture id="footSpaceTexture" color="0xFFE6E6E6"></Texture>
            </View>
            <View style="qun-foot-share-business-95" id="footShareBusiness">
                <Image style="qun-business-icon-95" id="businessIcon" value="images/foot_guild_icon2.png" radius="4,4,4,4"></Image>
                <Text style="qun-business-name-95" id="businessName" font="size.12" textcolor="0xFF999999" ellipsis="true" value="&#x817E;&#x8BAF;&#x9891;&#x9053;"></Text>
            </View>
        </View>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('qunpro95', `<View id="qunpro" style="forum-container-95" metadatatype="detail" radius="6,6,6,6">
    <Texture id="bgColor1" color="0xFFFFFFFF"></Texture>
    <Event>
        <OnResize value="app.OnResize" name="OnResize"></OnResize>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
        <OnActivate value="app.OnActivate" name="OnActivate"></OnActivate>
        <OnMouseDown value="app.OnMouseDown" name="OnMouseDown"></OnMouseDown>
        <OnMouseUp value="app.OnMouseUp" name="OnMouseUp"></OnMouseUp>
    </Event>
    <View style="forum-wrap-95" id="forumWrap">
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('header95', `<View style="forum-header-wrap-95" id="header" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="forum-header-95" id="header" metadatatype="data">
        <View style="header-left-95" id="headerLeft">
            <Image style="header-image-95" id="avatar" value="" stretch="1" visible="true" radius="4,4,4,4"></Image>
        </View>
        <View style="header-right-95" id="headerRight">
            <View style="header-right-top-95" id="headerRightTop">
                <View style="left-text-95" id="headerRightTopLeft">
                    <Text id="guildName" style="guild-name-95" autosize="true" textcolor="0xFF222222" font="size.13" ellipsis="true" value="" align="4"></Text>
                </View>
                <View style="space-95" id="headerRightSpace">
                    <Texture id="spaceColor" color="0xFF222222"></Texture>
                </View>
                <View style="header-right-guild-name-95" id="headerRightTopRight">
                    <Text id="channelName" style="channel-name-95" autosize="true" textcolor="0xFF222222" font="size.13" ellipsis="true" value="" align="4"></Text>
                </View>
            </View>
            <View style="header-right-bottom-95" id="headerRightBottom">
                <Text id="publish" style="publish-95" autosize="true" textcolor="0xFFA2A5AC" font="size.10" ellipsis="true" value="" align="4"></Text>
            </View>
        </View>
    </View>
    <View style="forum-space-95" id="headerSpace">
        <Texture id="forumSpace" color="0xFFD9D9DC"></Texture>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('image95', `<View style="image-wrap-95" id="imageWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
</View>`);

    ArkGlobalContext._setViewTemplate('record95', `<View style="record-wrap-95" id="recordWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="record-content-95">
        <View style="record-left-wrap-95">
            <Image style="record-image" id="recordImage" value="images/message.png" stretch="2"></Image>
            <Text id="messageText" style="record-message-wrap-AttributeName" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="&#x6D4F;&#x89C8;" align="4"></Text>
            <Text id="messageCount" style="message-count-95" autosize="true" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="" align="4"></Text>
        </View>
        <View style="record-space-95" id="linkTextWrap">
            <Texture id="recordSpace" color="0xFFA9ACB3"></Texture>
        </View>
        <View style="record-right-wrap-95">
            <View style="record-images-wrap" id="recordImagesWrap">
        </View>
        <View style="record-images-count-wrap-95">
                <Text id="emojiCount" style="record-images-count-95" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="" align="4"></Text>
            </View>
        </View>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('comment95', `<View style="comment-wrap-95" id="commentWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="comment-content-space-95" id="spaceView">
        <Texture color="0xFFD9D9DC" id="space"></Texture>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('commentItem95', `<View style="comment-item-wrap-95" id="commentItemWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="comment-item-left-95" id="commentItemLeft">
        <Text id="commentItemNick" style="comment-item-nick-95" textcolor="0xFF222222" font="size.13" value="" align="4"></Text>
    </View>
    <View style="comment-item-right-95" id="commentItemRight">
        
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('emoji95', `<View style="emoji-feed-wrap-95" id="emoji95" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="emoji-feed-content-95" id="emojiFeedContent">
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('rank', `<View id="rank" style="container" metadatatype="detail">
    <Event>
        <OnResize value="app.OnResize" name="OnResize"></OnResize>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
    </Event>
</View>`);

    ArkGlobalContext._setViewTemplate('text', `<View style="feed-wrap" id="feedWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
    <View style="feed-title-wrap" id="feedTitleWrap">
    </View>
    <View style="feed-content" id="feedContent">
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('qun', `<View style="qun-feed-wrap" id="qun" metadatatype="detail" radius="8,8,8,8">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="qun-feed-content-wrap" id="qunFeedContentWrap">
        <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
        <View style="qun-feed-header">
            <View style="qun-feed-header-left">
                <Image style="header-image" id="avatar" value="" stretch="1" visible="true" radius="4,4,4,4"></Image>
            </View>
            <View style="qun-feed-header-right">
                <Text id="guildName" style="qun-pro-nick" textcolor="0xFF999999" autosize="true" font="size.12" ellipsis="true" value="" align="4"></Text>
            </View>
        </View>
        <View style="qun-feed-title-wrap" id="qunFeedTitle">
        </View>
        <View style="qun-feed-text" id="qunFeedText">
        </View>
        <View style="qun-feed-image-wrap" visible="true" id="qunFeedImageWrap">
            <View style="qun-feed-image" id="qunFeedImage" radius="6,6,6,6">
                <Image id="qunFeedImageTexture" radius="6,6,6,6"></Image>
            </View>
        </View>
    </View>
    <View style="qun-feed-tag-wrap" id="qunFeedTagWrap">
        <Texture id="bgColor1" color="0xFFFAFAFA"></Texture>
        <Text id="qunFeedTag" style="qun-feed-tag" textcolor="0xFF999999" font="size.12" ellipsis="true" value="&#x817E;&#x8BAF;&#x9891;&#x9053;" align="4"></Text>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('preview', `<View style="preview-feed-wrap" id="preview" metadatatype="detail">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="preview-feed-content-wrap" id="previewFeedContentWrap">
        <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
        <View style="preview-feed-header">
            <View style="preview-feed-header-left">
                <Image style="preview-header-image" id="avatar" value="" stretch="1" visible="true" radius="3,3,3,3"></Image>
            </View>
            <View style="preview-feed-header-right">
                <View style="preview-left-text" id="headerRightTopLeft">
                    <Text id="guildName" style="guild-name" autosize="true" textcolor="0xFF222222" font="size.12" ellipsis="true" value="" align="4"></Text>
                </View>
                <View style="space" id="headerRightSpace">
                    <Texture id="spaceColor" color="0xFF999999"></Texture>
                </View>
                <View style="preview-header-right-guild-name" id="headerRightTopRight">
                    <Text id="channelName" style="preview-channel-name" autosize="true" textcolor="0xFF222222" font="size.12" ellipsis="true" value="" align="4"></Text>
                </View>
            </View>
        </View>
        <View style="preview-feed-title-wrap" id="previewFeedTitle">
        </View>
        <View style="preview-feed-text" id="previewFeedText">
        </View>
        <View style="preview-feed-image-wrap" visible="true" id="previewFeedImageWrap">
            <View style="preview-feed-image" id="previewFeedImage">
                <Image id="previewFeedImageTexture"></Image>
            </View>
        </View>
    </View>
    <View style="preview-feed-tag-wrap" id="previewFeedTagWrap">
        <Texture id="bgColor1" color="0xFFFFFFFF"></Texture>
        <Image id="channelImage" style="channel-image" value="images/channel.png"></Image>
        <Text id="previewFeedTag" style="preview-feed-tag" textcolor="0xFF999999" font="size.12" ellipsis="true" value="&#x817E;&#x8BAF;&#x9891;&#x9053;" align="4"></Text>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('header', `<View style="forum-header-wrap" id="header" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="forum-header" id="header" metadatatype="data">
        <View style="header-left" id="headerLeft">
            <Image style="header-image" id="avatar" value="" stretch="1" visible="true" radius="4,4,4,4"></Image>
        </View>
        <View style="header-right" id="headerRight">
            <View style="header-right-top" id="headerRightTop">
                <View style="left-text" id="headerRightTopLeft">
                    <Text id="guildName" style="guild-name" autosize="true" textcolor="0xFF222222" font="size.13" ellipsis="true" value="" align="4"></Text>
                </View>
                <View style="space" id="headerRightSpace">
                    <Texture id="spaceColor" color="0xFF222222"></Texture>
                </View>
                <View style="header-right-guild-name" id="headerRightTopRight">
                    <Text id="channelName" style="channel-name" autosize="true" textcolor="0xFF222222" font="size.13" ellipsis="true" value="" align="4"></Text>
                </View>
            </View>
            <View style="header-right-bottom" id="headerRightBottom">
                <Text id="publish" style="publish" autosize="true" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="" align="4"></Text>
            </View>
        </View>
    </View>
    <View style="forum-space" id="headerSpace">
        <Texture id="forumSpace" color="0xFFD9D9DC"></Texture>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('link', `<View style="link-wrap" id="linkWrap" metadatatype="data" radius="2,2,2,2">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
    
    <Image id="linkImage" style="link-image" value="images/icon_link.png" stretch="2" visible="true"></Image>
    <View style="link-text-wrap" id="linkTextWrap">
        <Text id="linkText" style="link-text" textcolor="0xFF2D77E5" font="size.12" ellipsis="true" value="" align="4"></Text>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('group', `<View style="group-wrap" id="groupWrap" metadatatype="data" radius="2,2,2,2">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
    <View style="group-image-wrap" radius="6,6,6,6">
        <Image id="groupImage" style="group-image" stretch="2" visible="true"></Image>
    </View>
    <View style="group-text-wrap" id="groupTextWrap">
        <Text id="groupText" style="group-text" textcolor="0xFF2D77E5" font="size.12" ellipsis="true" value="" align="4"></Text>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('guild', `<View style="guild-wrap" id="guildWrap" metadatatype="data" radius="2,2,2,2">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
    <Image id="guildImage" style="guild-image" value="images/feed-channel.png" stretch="2" visible="true"></Image>
    <View style="guild-text-wrap" id="guildTextWrap">
        <Text id="guildText" style="guild-text" textcolor="0xFF2D77E5" font="size.12" ellipsis="true" value="" align="4"></Text>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('image', `<View style="image-wrap" id="imageWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
</View>`);

    ArkGlobalContext._setViewTemplate('extraLen', `<View style="extra-len-wrap" id="extraLenWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    </Event>
    <View style="extra-len-wrap-content" id="extraLenWrapContent" radius="4,0,4,0">
        <Texture id="bgColor" color="0x80000000"></Texture>
        <View style="extra-len-text-wrap" id="extraTextWrap">
            <Text id="extraLenText" style="extra-len-text" textcolor="0xFFFFFFFF" font="size.12" ellipsis="true" value="" align="5"></Text>
        </View>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('record', `<View style="record-wrap" id="recordWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="record-content">
        <View style="record-left-wrap">
            <Image style="record-image" id="recordImage" value="images/message.png" stretch="2"></Image>
            <Text id="messageText" style="record-message-wrap-AttributeName" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="&#x6D4F;&#x89C8;" align="4"></Text>
            <Text id="messageCount" style="message-count" autosize="true" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="" align="4"></Text>
        </View>
        <View style="record-space" id="linkTextWrap">
            <Texture id="recordSpace" color="0xFFA9ACB3"></Texture>
        </View>
        <View style="record-right-wrap">
            <View style="record-images-wrap" id="recordImagesWrap">
        </View>
        <View style="record-images-count-wrap">
                <Text id="emojiCount" style="record-images-count" textcolor="0xFFA2A5AC" font="size.12" ellipsis="true" value="" align="4"></Text>
            </View>
        </View>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('comment', `<View style="comment-wrap" id="commentWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="comment-content-space" id="spaceView">
        <Texture color="0xFFD9D9DC" id="space"></Texture>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('commentItem', `<View style="comment-item-wrap" id="commentItemWrap" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="comment-item-left" id="commentItemLeft">
        <Text id="commentItemNick" style="comment-item-nick" textcolor="0xFFA2A5AC" font="size.13" value="" align="4"></Text>
    </View>
    <View style="comment-item-right" id="commentItemRight">
        
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('emoji', `<View style="emoji-feed-wrap" id="emoji" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="emoji-feed-content" id="emojiFeedContent">
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('empty', `<View style="empty-wrap" id="empty" metadatatype="data">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
    </Event>
    <View style="empty-left" id="emptyLeft">
        <Text id="emptyTitle" style="empty-title" textcolor="0xFF222222" font="size.17" ellipsis="true" value="&#x5E16;&#x5B50;&#x5185;&#x5BB9;&#x627E;&#x4E0D;&#x5230;&#x4E86;" align="4"></Text>
        <Text id="emptySubTitle" style="empty-sub-title" textcolor="0xFF999999" font="size.13" ellipsis="true" value="&#x53BB;&#x9891;&#x9053;&#x53D1;&#x73B0;&#x66F4;&#x591A;&#x7CBE;&#x5F69;&#x5185;&#x5BB9;&#xFF5E;" align="4"></Text>
        <View style="empty-content-left">
            <Image style="empty-emoji-icon" id="avatar" value="" visible="true"></Image>
            <View style="empty-content">
                <View style="empty-left-text" id="emptyGuildName">
                    <Text id="guildName" style="empty-guild-name" autosize="true" textcolor="0xFFB2B2B2" font="size.14" ellipsis="true" value="" align="4"></Text>
                </View>
                <View style="empty-space" id="headerRightSpace">
                    <Texture id="spaceColor" color="0xFFB2B2B2"></Texture>
                </View>
                <View style="empty-channel-name" id="emptyChannelName">
                    <Text id="channelName" style="channel-name" autosize="true" textcolor="0xFFB2B2B2" font="size.14" ellipsis="true" value="" align="4"></Text>
                </View>
            </View>
        </View>
    </View>
    <View style="empty-right" id="emptyRight">
        <Image style="empty-channel-icon" id="emojiIcon" value="images/icon-channel.png" visible="true"></Image>
    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('c2c', `<View id="c2c" style="c2c-container" metadatatype="c2c">
    <Event>
        <OnResize value="app.OnResize" name="OnResize"></OnResize>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
    </Event>
    <View style="c2c-main" id="c2cMain">
        <Texture id="mainBgColor" color="0xFFFFFFFF"></Texture>
        <View style="c2c-main-title-wrap">
            <Text style="c2c-main-title" id="c2cMainTitle" textcolor="0xFF03081A" font="size.17" multiline="false" ellipsis="true" value="ark&#x6B22;&#x8FCE;"></Text>
        </View>
        <View style="c2c-desc">
            <View style="c2c-desc-text-wrap" id="c2cDescTextWrap">
            </View>
            <View style="c2c-desc-image-wrap">
                <Image style="c2c-image" id="image" value="" stretch="1" radius="6,6,6,6"></Image>
            </View>
        </View>
    </View>
    <View style="c2c-tag" id="c2cTag">
        <Texture id="tagColor" color="0xFFF5F6FA"></Texture>
        <Text style="c2c-tag-title" id="c2cTagTitle" textcolor="0xFF878B99" font="font.12" multiline="false" ellipsis="true" autosize="true" value="&#x817E;&#x8BAF;&#x9891;&#x9053;" align="4"></Text>
    </View>
</View>`);

    var global$x = ArkWindow;

    (function(global) {
        var STORAGE_KEY_PREFIX = "forum";
        global.console = {
            allowPerformance: false,
            MAX_LOG_DEPTH: 10,
            _log: function(arg, depth) {
                var res = [];
                var type = typeof arg;
                if (type == 'object') {
                    var keyLen = 0;
                    for (var key in arg) {
                        keyLen = keyLen + 1;
                    }
                    if (keyLen == 0) {
                        res.push(ArkWindow.console._toString(arg));
                    } else {
                        var tmp = [];
                        for (var i = 0; i < depth; ++i) {
                            tmp.push('    ');
                        }
                        tmp = tmp.join('');
                        var tmp1 = tmp + '    ';
                        res.push('{');
                        var i = 0;
                        for (var key in arg) {
                            res.push('\n' + tmp1 + key + ' : ');
                            if (depth >= ArkWindow.console.MAX_LOG_DEPTH) {
                                res.push(ArkWindow.console._toString(arg[key]));
                            } else {
                                res.push(ArkWindow.console._log(arg[key], depth + 1));
                            }
                            i = i + 1;
                            if (i < keyLen) {
                                res.push(',');
                            }

                        }
                        res.push('\n' + tmp + '}');
                    }

                } else {
                    res.push(ArkWindow.console._toString(arg));
                }
                return res.join('');
            },
            _toString: function(arg) {
                var type = Object.prototype.toString.call(arg);
                if (type == '[object Null]') {
                    return 'Null';
                } else if (type == '[object Undefined]') {
                    return 'Undefined';
                } else if (arg && arg.toString && typeof arg.toString == 'function') {
                    return arg.toString();
                } else {
                    return 'Unknow Type';
                }
            },
            log: function() {
                if (ArkWindow.console.allowPerformance) return;
                var res = [];
                for (var i = 0; i < arguments.length; ++i) {
                    res.push(ArkWindow.console._log(arguments[i], 0));
                }
                arkWeb.Console.Log('[com.tencent.forum log]:');
                arkWeb.Console.Log(res.join('\n'));
            },
            warn: function() {
                if (ArkWindow.console.allowPerformance) return;
                var res = [];
                for (var i = 0; i < arguments.length; ++i) {
                    res.push(ArkWindow.console._log(arguments[i], 0));
                }
                arkWeb.Console.Log('[com.tencent.forum warn]:');
                arkWeb.Console.Log(res.join('\n'));
            },
            error: function(shuoldPrint) {
                if (ArkWindow.console.allowPerformance) return;
                var res = [];
                for (var i = 0; i < arguments.length; ++i) {
                    res.push(ArkWindow.console._log(arguments[i], 0));
                }
                arkWeb.Console.Log('[com.tencent.forum error]:');
                arkWeb.Console.Log(res.join('\n'));
            },
            timeLog() {
                if (ArkWindow.console.allowPerformance) return;
                var res = [];
                for (var i = 0; i < arguments.length; ++i) {
                    res.push(ArkWindow.console._log(arguments[i], 0));
                }
                arkWeb.Console.Log('[com.tencent.forum timelog]:');
                arkWeb.Console.Log(res.join('\n'));
            },
            time(key, time) {
                var data = Date.now();
                global.console.timeLog('spend time: ---> ' + data + '---->' + key);
            }
        };


        var timerId = 0;
        var timerMap = {};

        function createTimer(func, ms) {
            var timer = arkWeb.Timer();
            var _timerId = timerId++;
            timerMap[_timerId] = timer;
            timer.SetInterval(ms);
            timer.AttachEvent("OnTimer", function(timer) {
                func(timer);
            });
            timer.Start();
            return _timerId;
        }

        global.setTimeout = function(func, ms) {
            return createTimer(function(timer) {
                func();
                timer.Stop();
            }, ms);
        };

        global.setInterval = function(func, ms) {
            return createTimer(function(timer) {
                func();
            }, ms);
        };

        global.clearTimeout = global.clearInterval = function(_timerId) {
            var timer = timerMap[_timerId];
            if (timer) {
                timer.Stop();
                delete timerMap[_timerId];
            }
        };

        global.appVersion = function() {
            var ver = GetApplicationVersion();
            // js 不支持64位数的位运算
            var highVer = Math.floor(ver / 0xffffffff);
            var v1 = (highVer >>> 16) & 0xffff;
            var v2 = highVer & 0xffff;
            var v3 = (ver >>> 16) & 0xffff;
            var v4 = ver & 0xffff;
            var str = v1 + "." + v2 + "." + v3 + "." + v4;
            return str;
        };
        global.hasEmoji = function(str) {
            let emojiRule = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
            return emojiRule.test(str);
        };
        global.baseUrl = function() {
            const isTest = true;
            return isTest ? 'https://qun.qq.com/guild/gotrpc/test/' : 'https://qun.qq.com/guild/gotrpc/v1/';
        };
        global.httpPost = function(requestParams) {
            if (!global.isPureObject(requestParams)) {
                ArkWindow.console.error('[HttpRequest] requestParams error');
                return;
            }
            var defaultRequestParams = {};
            requestParams = Object.assign({}, defaultRequestParams, requestParams);
            var requestUrl = requestParams.requestUrl;
            var data = requestParams.data;
            var onSuccess = requestParams.onSuccess;
            var onComplete = requestParams.onComplete;

            var http = Net.HttpRequest();
            var originUin = (QQ && QQ.GetUIN) ? QQ.GetUIN() : '';

            ArkWindow.console.warn('request', requestUrl, data);
            http.AttachEvent("OnComplete", function() {
                var requestSuccess = http.IsSuccess();
                var requestData = http.GetData();
                http.DetachEvent('OnComplete');
                ArkWindow.console.warn('requestSuccess', String(requestSuccess), JSON.stringify(requestData));
                if (requestSuccess && requestData && requestData.data && requestData.retcode == 0) {
                    ArkWindow.console.warn('retcode' + JSON.stringify(requestData.retcode));
                    global.isFunction(onSuccess) && onSuccess(requestData.data);
                    return;
                }
                global.isFunction(onComplete) && onComplete(requestData);
            });
            if (QQ && QQ.GetPskeyAsync) {
                //这里后续考虑cache。
                QQ.GetPskeyAsync("qun.qq.com", function(pskey) {
                    if (pskey) {
                        ArkWindow.console.warn('QQ.GetPskeyAsync', pskey);
                        var puin = global.generatePuin(originUin + '');
                        var cookies = 'p_uin=' + puin + ';p_skey=' + pskey + ';uin=' + originUin;
                        ArkWindow.console.warn('QQ.cookies', cookies);
                        http.SetCookie(cookies);
                        ArkWindow.console.warn(cookies);
                        http.SetTimeout(30000);
                        http.SetHeader('Content-type', 'application/json');
                        ArkWindow.console.warn('QQ.requestUrl', requestUrl, data);
                        http.Post(requestUrl, data);
                    } else {
                        ArkWindow.console.warn("fail pskey");
                    }
                });
            }
        };
        global.getStoreKey = function(key) {
            return STORAGE_KEY_PREFIX + '_' + key;
        };

        global.getItem = function(key) {
            try {
                return arkWeb.Storage.Load(ArkWindow.getStoreKey(key));
            } catch (e) {
                return "";
            }
        };

        global.setItem = function(key, value) {
            try {
                arkWeb.Storage.Save(ArkWindow.getStoreKey(key), value);
            } catch (e) {}
        };
        global.isPureObject = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        };
        global.isFunction = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Function]';
        };
        global.generatePuin = function(originUin) {
                var prefixStr = 'o';
                var len = originUin.length;
                var zeroLength = 0;

                if (len < 10) {
                    zeroLength = 10 - len;
                }

                for (var i = 0; i < zeroLength; i += 1) {
                    prefixStr = prefixStr + '0';
                }
                return prefixStr + originUin
            },
            global.baseUrl = function() {
                const isTest = true;
                return isTest ? 'https://qun.qq.com/guild/gotrpc/test/' : 'https://qun.qq.com/guild/gotrpc/v1/';
            };
        global.replaceAllEmoji = function(str) {
            if (!str) {
                return '';
            }
            var emojiRule = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
            return str.replace(emojiRule, '[emoji]');
        };
        /** 频道分享的类型 */
        global.ARK_SHARE_TYPE = {
            INVALID: 0, // 无效类型
            ARK_TEXT: 1, // 文字频道
            ARK_VOICE: 2, // 语音频道
            ARK_HOMEPAGE: 3, // 主页频道
            ARK_HIDDEN: 4, // 隐藏频道
            ARK_LIVE: 5, // 直播频道
            ARK_APPLICATION: 6, // 应用频道
            ARK_FORUM: 7, // 论坛频道
            ARK_META: 8, // 元宇宙子频道
            ARK_GUILD: 10, // 这里从10开始，避免之后有新增的子频道类型
            ARK_SCHEDULE: 11, // 日程频道
            ARK_YOULE_GAME: 12, // 有乐小游戏应用子频道
            ARK_FEED_SQUARE: 13 //帖子广场
        };
    })(global$x);


    ArkWindow.QQ = QQ;
    ArkWindow.global = global$x;

    function createAssigner(keysFunc, defaults) {
        return function(obj) {
            var length = arguments.length;
            if (defaults) obj = Object(obj);
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!defaults || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    }

    function has(obj, path) {
        return obj != null && Object.prototype.hasOwnProperty.call(obj, path);
    }
    function isObject(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    }
    function allKeys(obj) {
        if (!isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }
    function keys(obj) {
        if (!isObject(obj)) return [];
        var keys = [];
        for (var key in obj)
            if (has(obj, key)) keys.push(key);
        return keys;
    }
    /*
     * UrlParser
     */
    function UrlParser(url) {
        this.url = url;

        this._schemeIndex = this.NOT_CALCULATED;
        this.scheme = this.parseScheme();
        this.authority = this.parseAuthority(this.url, this._schemeIndex);
        this.path = this.parsePath();
    }

    UrlParser.prototype.NOT_FOUND = -1;
    UrlParser.prototype.NOT_CALCULATED = -2;

    UrlParser.prototype.findSchemeSeparator = function() {
        if (this._schemeIndex === this.NOT_CALCULATED) {
            var pos = this.url.indexOf(':');
            if (pos < 0) {
                this._schemeIndex = this.NOT_FOUND;
            } else {
                this._schemeIndex = pos;
            }
        }
        return this._schemeIndex;
    };

    UrlParser.prototype.parseScheme = function() {
        var ssi = this.findSchemeSeparator();
        if (ssi === this.NOT_FOUND) {
            return "";
        }
        return this.url.substr(0, ssi);
    };

    UrlParser.prototype.parseAuthority = function(url, ssi) {
        if (url.length <= ssi + 2 ||
            url.charAt(ssi + 1) !== '/' ||
            url.charAt(ssi + 2) !== '/') {
            // no authority
            return "";
        }

        var start = ssi + 3;
        var end = start;
        while (end < url.length) {
            if (this.isSeperator(url.charAt(end))) {
                break;
            }
            end++;
        }
        var len = end - start;
        return url.substr(start, len);
    };

    UrlParser.prototype.parsePath = function() {
        var ssi = this.findSchemeSeparator();
        if (ssi > -1) {
            if (ssi + 1 === this.url.length) {
                // empty uri
                return "";
            }

            if (this.url.charAt(ssi + 1) !== '/') {
                // not parse opaque uri
                return "";
            }
        }
        return this.doParsePath(this.url, ssi);
    };

    UrlParser.prototype.doParsePath = function(url, ssi) {
        var pathStart = 0;
        if (url.length > ssi + 2 &&
            url.charAt(ssi + 1) === '/' &&
            url.charAt(ssi + 2) === '/') {
            pathStart = ssi + 3;
            while (pathStart < url.length) {
                if (this.isSeperator(url.charAt(pathStart))) {
                    break;
                }
                pathStart++;
            }
        } else {
            //path starts after scheme
            pathStart = ssi + 1;
        }

        //find end of path
        var pathEnd = pathStart;
        while (pathEnd < url.length) {
            if (this.isCharIn(url.charAt(pathEnd), "?#")) {
                break;
            }
            pathEnd++;
        }
        return url.substr(pathStart, pathEnd - pathStart);
    };

    UrlParser.prototype.isCharIn = function(char, string) {
        if (!string) {
            return false;
        }
        for (var i = 0; i < string.length; ++i) {
            if (char === string.charAt(i)) {
                return true;
            }
        }
        return false;
    };

    UrlParser.prototype.isSeperator = function(char) {
        var PATH_SEPERATOR = "/\\?#";
        return this.isCharIn(char, PATH_SEPERATOR);
    };


    ArkWindow.util = {
        fixurl: function(url, isHttp) {
            if (url == "local" || !url) {
                return url;
            }
            if (url.indexOf('miniapp://') == 0 || url.indexOf('res:') == 0 || ArkWindow.util.isLocalResUrl(url)) {
                return url;
            }
            if (url.indexOf('m.q.qq.com') == 0) {
                return "https://" + url;
            }
            if (url.indexOf('http:') == 0 || url.indexOf('https:') == 0) {
                return url;
            }
            if (isHttp) {
                return "http://" + url;
            } else {
                return "https://" + url;
            }
        },
        isLocalResUrl: function(url) {
            if (!url) {
                return false;
            }
            if (url && url.indexOf && url.indexOf('image/') == 0) {
                return true;
            } else {
                return false;
            }
        },
        createHttpRequest: function() {
            if (Net && Net.HttpRequest) {
                return Net.HttpRequest();
            }
            return Http.CreateHttpRequest();
        },
        httpDownload: function(url, callback) {
            var httpGet = ArkWindow.util.createHttpRequest();
            var httpStartTime = arkWeb.System.Tick();
            ArkWindow.console.log('start get resource ' + url + ' at ' + httpStartTime);
            httpGet.SetTimeout(5000);
            httpGet.AttachEvent("OnComplete", function(http) {
                var httpEndTime = arkWeb.System.Tick();
                ArkWindow.console.log('end get resource ' + url + ' at ' + httpEndTime);
                ArkWindow.console.log('get resource ' + url + ' cost: ' + (httpEndTime - httpStartTime));
                if (!http.IsSuccess()) {
                    callback({
                        code: http.GetStatusCode(),
                        msg: 'download url: ' + url + 'fail.'
                    });
                    return;
                } else {
                    callback(null, http.GetCachePath());
                }
            });
            httpGet.Get(url);
        },
        _setImageStyle: function(viewObject, view, url, width, height) {
            var viewRatio = view.width / view.height;
            var imageRatio = width / height;
            var anchors;
            var setWidth;
            var setHeight;
            var marginTop = 0;
            var marginLeft = 0;

            if (viewRatio > imageRatio) {
                // 容器的宽大于图片的宽，宽铺满，高度上下居中
                anchors = 5;
                setWidth = 0;
                setHeight = view.width / width * height;
                // marginTop = (view.height - setHeight) / 2;
            } else {
                // 高度铺满，宽居中
                anchors = 10;
                setHeight = 0;
                setWidth = width / height * view.height;
                // marginLeft = (view.width - setWidth) / 2;
            }

            ArkWindow.console.log(
                'setImageStyle anchor: ' +
                (view.anchors || anchors) +
                ', width: ' + setWidth +
                ', heihgt: ' + setHeight +
                ', url: ' + url
            );

            viewObject.SetAnchors(view.anchors || anchors);
            viewObject.SetSize(setWidth, setHeight);
            viewObject.SetMargin(marginLeft, marginTop, 0, 0);
            viewObject.SetValue(url);
        },
        _setImage: function(url, viewObject, view, isHttps, retryTime, callback) {
            retryTime -= 1;
            var imageUrl = ArkWindow.util.fixurl(url, isHttps);
            viewObject.AttachEvent('OnLoad', function(sender) {
                ArkWindow.console.log('viewObject OnLoad');

                viewObject.DetachEvent("OnError");
                viewObject.DetachEvent("OnLoad");

                callback();
            });

            var storageData = arkWeb.Storage.Load(imageUrl);
            var storagePath = storageData && storageData.path;

            ArkWindow.console.log('storage data:');
            ArkWindow.console.log(storageData);

            if (storagePath) {
                ArkWindow.console.log('use storage');
                viewObject.AttachEvent("OnError", function(sender) {
                    ArkWindow.console.log('viewObject OnError');
                    viewObject.DetachEvent("OnError");
                    viewObject.DetachEvent("OnLoad");
                    arkWeb.Storage.Save(imageUrl, {});
                    if (retryTime) {
                        ArkWindow.util._setImage(url, viewObject, view, isHttps, retryTime, callback);
                    } else {
                        callback({
                            code: -1,
                            msg: 'load netwrok image error'
                        });
                    }
                });

                ArkWindow.util._setImageStyle(viewObject, view, storagePath, storageData.width, storageData.height);
            } else {
                ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                    if (err) {
                        if (retryTime) {
                            ArkWindow.util._setImage(url, viewObject, view, isHttps, retryTime, callback);
                        } else {
                            callback(err);
                        }
                    } else {
                        viewObject.AttachEvent("OnError", function(sender) {
                            viewObject.DetachEvent("OnError");
                            viewObject.DetachEvent("OnLoad");
                            arkWeb.Storage.Save(imageUrl, {});
                            if (retryTime) {
                                ArkWindow.util._setImage(url, viewObject, view, isHttps, retryTime, callback);
                            } else {
                                callback({
                                    code: -1,
                                    msg: 'load image error'
                                });
                            }
                        });

                        var img = UI.Image();
                        img.AttachEvent("OnError", function(sender) {
                            ArkWindow.console.log(url + ' OnError');

                            // 失败了只能设置默认宽高
                            ArkWindow.util._setImageStyle(viewObject, view, path, 250, 250);
                        });

                        img.AttachEvent("OnLoad", function(sender) {
                            ArkWindow.console.log(url + ' OnLoad');

                            var size = sender.GetSize();
                            ArkWindow.console.log('width: ' + size.width + ' height: ' + size.height);

                            arkWeb.Storage.Save(imageUrl, {
                                path: path,
                                width: size.width,
                                height: size.height
                            });

                            ArkWindow.util._setImageStyle(viewObject, view, path, size.width, size.height);
                        });

                        img.SetValue(path);
                    }
                });
            }
        },
        /*
            设置图片元素的图片链接
        */
        setImage: function(url, viewObject, view, callback) {
            callback = callback || function() {};

            if (ArkWindow.util.isLocalResUrl(url)) {
                ArkWindow.console.log('set local image: ' + url);
                viewObject.AttachEvent('OnLoad', function() {
                    viewObject.DetachEvent("OnError");
                    viewObject.DetachEvent("OnLoad");
                    callback();
                });
                viewObject.AttachEvent("OnError", function(sender) {
                    viewObject.DetachEvent("OnError");
                    viewObject.DetachEvent("OnLoad");
                    callback({
                        code: -1,
                        msg: 'load local image error'
                    });
                });
                viewObject.SetValue(url);
            } else {
                ArkWindow.console.log('set netwrok image: ' + url);
                //先用2次http，如果失败再用2次https
                ArkWindow.util._setImage(url, viewObject, view, false, 2, function(err) {
                    if (err) {
                        ArkWindow.util._setImage(url, viewObject, view, true, 2, function(err) {
                            callback(err);
                        });
                    } else {
                        callback();
                    }
                });
            }

        },
        isiOS: function() {
            return arkWeb.System.GetOS() == "iOS";
        },
        isAndroid: function() {
            return arkWeb.System.GetOS() == "Android";
        },
        isWindows: function() {
            return arkWeb.System.GetOS() == "Windows";
        },
        isMac: function() {
            return arkWeb.System.GetOS() == "Mac";
        },
        compareVersion: function(target, cmd) {
            var _compare = function(tokens1, tokens2, p) {
                if (!tokens1[p] && !tokens2[p]) {
                    return 0;
                }
                return ((tokens1[p] || 0) - (tokens2[p] || 0)) || _compare(tokens1, tokens2, p + 1);
            };
            if (QQ && QQ.GetVersion) {

                var r = _compare(QQ.GetVersion().split('.'), (target + '').split('.'), 0);
                r = r < 0 ? -1 : r > 0 ? 1 : 0;
                switch (cmd) {
                    case 'eq':
                        return r === 0;
                    case 'neq':
                        return r !== 0;
                    case 'lt':
                        return r < 0;
                    case 'nlt':
                        return r >= 0;
                    case 'gt':
                        return r > 0;
                    case 'ngt':
                        return r <= 0;
                    default:
                        return r;
                }
            } else {
                return false;
            }

        },
        /*
        检测当前QQ版本号是否低于指定版本号，现在支持iOS平台和Android平台
        iOSTargetVersionStr iOS需要判断的版本号，字符串，三位，传入格式如"8.0.0“
        androidTargetVersionStr android需要判断的版本号，字符串，三位，传入格式如”8.0.0“
        */
        isCurrentQQVersionBelowTargetVersion: function(iOSTargetVersionStr, androidTargetVersionStr) {
            if (ArkWindow.util.isiOS()) {
                return ArkWindow.util.compareVersion(iOSTargetVersionStr, 'lt');
            } else if (ArkWindow.util.isAndroid()) {
                return ArkWindow.util.compareVersion(androidTargetVersionStr, 'lt');
            } else {
                return false;
            }
        },
        getAvatar: function(uin, size, platform) {
            if (!uin) {
                return '';
            }
            size = size || 100;
            platform = platform || 'qq';
            if (platform != 'qq' || platform != 'qzone') {
                platform = 'qq';
            }
            if (platform == 'qq') {
                if (size != 40 || size != 100 || size != 140) {
                    size = 100;
                }
                return 'q.qlogo.cn/openurl/' + uin + '/' + uin + '/' + size + '?rf=qz_hybrid&c=' + ArkWindow.util.base62().encode('qz_hybrid@' + uin);
            } else if (platform == 'qzone') {
                if (size != 30 || size != 50 || size != 100) {
                    size = 100;
                }
                return 'qlogo' + (uin % 4 + 1) + '.store.qq.com/qzone/' + uin + '/' + uin + '/' + size;
            }

        },
        base62: function() {
            return {
                decode: function(a) {
                    return ArkWindow.util.base64().decode(a.replace(/ic/g, '/').replace(/ib/g, '+').replace(/ia/g, 'i'));
                },
                encode: function(a) {
                    return ArkWindow.util.base64().encode(a).replace(/[=i\+\/]/g, function(m) {
                        switch (m) {
                            case '=':
                                return '';
                            case 'i':
                                return 'ia';
                            case '+':
                                return 'ib';
                            case '/':
                                return 'ic';
                            default:
                                return '';
                        }
                    });
                }
            };
        },

        base64: function() {
            // constants
            var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            var b64tab = function(bin) {
                var t = {};
                for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
                return t;
            }(b64chars);
            var fromCharCode = String.fromCharCode;
            // encoder stuff
            var cb_utob = function(c) {
                if (c.length < 2) {
                    var cc = c.charCodeAt(0);
                    return cc < 0x80 ? c :
                        cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) +
                            fromCharCode(0x80 | (cc & 0x3f))) :
                        (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
                            fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
                            fromCharCode(0x80 | (cc & 0x3f)));
                } else {
                    var cc = 0x10000 +
                        (c.charCodeAt(0) - 0xD800) * 0x400 +
                        (c.charCodeAt(1) - 0xDC00);
                    return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
                        fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
                        fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
                        fromCharCode(0x80 | (cc & 0x3f)));
                }
            };
            var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
            var utob = function(u) {
                return u.replace(re_utob, cb_utob);
            };
            var cb_encode = function(ccc) {
                var padlen = [0, 2, 1][ccc.length % 3],
                    ord = ccc.charCodeAt(0) << 16 |
                    ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
                    ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
                    chars = [
                        b64chars.charAt(ord >>> 18),
                        b64chars.charAt((ord >>> 12) & 63),
                        padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                        padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
                    ];
                return chars.join('');
            };
            var btoa = function(b) {
                return b.replace(/[\s\S]{1,3}/g, cb_encode);
            };
            var _encode = function(u) {
                return btoa(utob(u))
            };

            var encode = function(u, urisafe) {
                return !urisafe ?
                    _encode(u) :
                    _encode(u).replace(/[+\/]/g, function(m0) {
                        return m0 == '+' ? '.' : '*';
                    }).replace(/=/g, '');
            };
            var encodeURI = function(u) {
                return encode(u, true)
            };
            // decoder stuff
            var re_btou = new RegExp([
                '[\xC0-\xDF][\x80-\xBF]',
                '[\xE0-\xEF][\x80-\xBF]{2}',
                '[\xF0-\xF7][\x80-\xBF]{3}'
            ].join('|'), 'g');
            var cb_btou = function(cccc) {
                switch (cccc.length) {
                    case 4:
                        var cp = ((0x07 & cccc.charCodeAt(0)) << 18) |
                            ((0x3f & cccc.charCodeAt(1)) << 12) |
                            ((0x3f & cccc.charCodeAt(2)) << 6) |
                            (0x3f & cccc.charCodeAt(3)),
                            offset = cp - 0x10000;
                        return (fromCharCode((offset >>> 10) + 0xD800) +
                            fromCharCode((offset & 0x3FF) + 0xDC00));
                    case 3:
                        return fromCharCode(
                            ((0x0f & cccc.charCodeAt(0)) << 12) |
                            ((0x3f & cccc.charCodeAt(1)) << 6) |
                            (0x3f & cccc.charCodeAt(2))
                        );
                    default:
                        return fromCharCode(
                            ((0x1f & cccc.charCodeAt(0)) << 6) |
                            (0x3f & cccc.charCodeAt(1))
                        );
                }
            };
            var btou = function(b) {
                return b.replace(re_btou, cb_btou);
            };
            var cb_decode = function(cccc) {
                var len = cccc.length,
                    padlen = len % 4,
                    n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) |
                    (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) |
                    (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) |
                    (len > 3 ? b64tab[cccc.charAt(3)] : 0),
                    chars = [
                        fromCharCode(n >>> 16),
                        fromCharCode((n >>> 8) & 0xff),
                        fromCharCode(n & 0xff)
                    ];
                chars.length -= [0, 0, 2, 1][padlen];
                return chars.join('');
            };
            var atob = function(a) {
                return a.replace(/[\s\S]{1,4}/g, cb_decode);
            };
            var _decode = function(a) {
                return btou(atob(a))
            };
            var decode = function(a) {
                return _decode(
                    a.replace(/[\.\*]/g, function(m0) {
                        return m0 == '.' ? '+' : '/'
                    })
                    .replace(/[^A-Za-z0-9\+\/]/g, '')
                );
            };

            var Base64 = {
                atob: atob,
                btoa: btoa,
                fromBase64: decode,
                toBase64: encode,
                utob: utob,
                encode: encode, //这个方法是正宗的base64算法
                encodeURI: encodeURI, //这个是根据我们后台变种的base64算法
                btou: btou,
                decode: decode
            };

            return Base64;
        },
        Report: function(id, index, action) {
            if (QQ && QQ.Report) {
                QQ.Report(id, index, action);
            } else {
                ArkWindow.console.log('QQ does not have Report method');
            }
        },
        ReportEx: function(type, data) {
            if (QQ && QQ.ReportEx) {
                QQ.ReportEx(type, data);
            } else {
                ArkWindow.console.log('QQ does not have ReportEx method');
            }
        },
        /*获取小程序url，因为url涉及版本兼容问题，所以收归到一个统一的方法*/
        getMiniAppUrl: function(url, scene, view) {
            // 获取scene值，如果传进来了scene，优先用传进来的，如果没传，判断AIO类型，单聊用1007，群聊用1008
            var sceneValue = 1007;
            if (typeof scene == "number" || scene) {
                sceneValue = scene;
            } else if (QQ.GetContainerInfo) {
                var info = QQ.GetContainerInfo(view.GetRoot());
                if (info) {
                    var typeStr = info.ChatType;
                    if (typeStr) {
                        var type = parseInt(typeStr, 10);
                        if (type <= 2) {
                            sceneValue = 1007;
                        } else if (type > 2) {
                            sceneValue = 1008;
                        }
                    }
                }
            }


            // 8.1.0以上版本正式QQ 都用这个schema打开，这个schema仅在ark场景适用
            var jmpUrl = "miniapp://open/" + sceneValue + "?url=" + Net.UrlEncode(url);

            // 安卓800 ios803以下不支持小程序，打开兜底页
            if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("8.0.3", "8.0.0")) {
                ArkWindow.console.log('may be regular QQ but version not support miniapp');
                jmpUrl = "https://m.q.qq.com/update";
            }

            // QQ8.1.0版本开始改用schema打开，8.1.0版本以前用http url打开
            if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("8.1.0", "8.1.0")) {
                ArkWindow.console.log("may be regular QQ but version lower then 810, use http url");
                jmpUrl = url;
            }

            // QQ极速版版本号从4.0.0开始，由于ark没有方法判断是否极速版，所以暂时把5.0.0以下的当作极速版
            if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("5.0.0", "5.0.0")) {
                ArkWindow.console.log("may be quick QQ, can open miniapp");
                jmpUrl = url;
            }

            ArkWindow.console.log("opening miniapp, url: " + jmpUrl);

            return jmpUrl;
        },
        isExistBoldTitle: function(key, array) {
            var titleLen = 0;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].title === key) {
                    titleLen++;
                }
            }
            return titleLen;
        },
        toUrlParams: function(obj) {
            var arr = [];
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k))
                    arr.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
            }
            return arr.join("&");
        },
        extend: createAssigner(allKeys),
        extendOwn: createAssigner(keys),

        verifyDomain: function(url, domains) {
            if (!url) {
                return false;
            }
            if (!domains || domains.length === 0) {
                return true;
            }

            function verifyHost(host, pattern) {
                if (!pattern) {
                    return true;
                }
                if (!host) {
                    return false;
                }

                if (pattern.charAt(0) !== '*') {
                    // full match
                    return host === pattern;
                }

                // remove prefix '*'
                pattern = pattern.substr(1);
                if (pattern.length > host.length) {
                    return false;
                }
                host = host.substr(host.length - pattern.length);
                return host === pattern;
            }

            function verifyPath(path, pattern) {
                if (!pattern) {
                    return true;
                }
                if (!path) {
                    return false;
                }

                if (pattern.charAt(pattern.length - 1) !== '*') {
                    return path === pattern;
                }
                // remove suffix '*'
                pattern = pattern.substr(0, pattern.length - 1);
                if (pattern.length > path.length) {
                    return false;
                }
                return path.substr(0, pattern.length) === pattern;
            }

            function verify(parser, domain) {
                var index = domain.indexOf('/');
                var hostPattern = null;
                var pathPattern = null;
                if (index >= 0) {
                    hostPattern = domain.substr(0, index);
                    pathPattern = domain.substr(index);
                } else {
                    hostPattern = domain;
                    pathPattern = null;
                }
                return verifyHost(parser.authority, hostPattern) &&
                    verifyPath(parser.path, pathPattern);
            }

            var parser = new UrlParser(url);
            if (typeof(domains) === 'string') {
                return verify(parser, domains);
            } else {
                // is array
                if (domains.length === 0) {
                    return true;
                }
                for (var i in domains) {
                    if (domains.hasOwnProperty(i)) {
                        if (verify(parser, domains[i])) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }

    };

    ArkWindow.createAssigner = createAssigner;
    ArkWindow.has = has;
    ArkWindow.isObject = isObject;
    ArkWindow.allKeys = allKeys;
    ArkWindow.keys = keys;
    ArkWindow.UrlParser = UrlParser;

    ArkWindow.http = {
        setCookie: function(http) { // 构造登录态
            if (QQ && QQ.GetPskey && QQ.GetUIN) {
                var pskey = QQ.GetPskey("qzone.qq.com");
                var uin = QQ.GetUIN();
                var cookie = "p_skey=" + pskey + ";p_uin=o" + uin + ";uin=o" + uin;
                http.SetCookie(cookie);
            }
        },

        setHeader: function(http, headers) {
            if (!headers) return;
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
            Object.keys(headers).forEach(function(name) {
                http.SetHeader(name, headers[name]);
            });
        },

        appendUrlParam: function(url, params) { //拼接 url
            if (!url) return '';
            Object.keys(params).forEach(function(name) {
                var value = params[name];
                var pattern = "[?&]" + name + "=";
                if (url.search(new RegExp(pattern)) == -1) { //参数不存在新增
                    url += url.indexOf("?") == -1 ? "?" : "&";
                    url += name + "=" + encodeURIComponent(value);
                } else { //存在则替换值
                    pattern = name + "=[^&#]*";
                    url = url.replace(new RegExp(pattern), name + "=" + encodeURIComponent(value));
                }
            });
            return url;
        },

        get: function(url, header, params, callback) { // get
            var http = Net.HttpRequest();
            http.SetTimeout(3000);
            this.setCookie(http);
            this.setHeader(http, header);
            params['t'] = new Date().getTime(); //时间戳
            var reqUrl = this.appendUrlParam(url, params);
            http.AttachEvent('OnComplete', function() {
                ArkWindow.console.log('-- get complete ' + reqUrl);
                if (typeof(callback) === 'function') {
                    callback(http.GetData('application/json'));
                }
            });
            ArkWindow.console.log('-- get ' + reqUrl);
            http.Get(reqUrl);
        },

        post: function(url, header, body, callback) { // post
            var http = Net.HttpRequest();
            http.SetTimeout(3000);
            this.setCookie(http);
            this.setHeader(http, header);
            var reqUrl = this.appendUrlParam(url, {
                "t": new Date().getTime()
            });
            http.AttachEvent('OnComplete', function() {
                ArkWindow.console.log('-- post complete ' + reqUrl);
                if (typeof(callback) === 'function') {
                    callback(http.GetData('application/json'));
                }
            });
            ArkWindow.console.log('-- post ' + reqUrl);
            http.Post(reqUrl, body);
        }
    };

    //  json2.js
    //  2017-06-12
    //  Public Domain.
    //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    //  NOT CONTROL.

    //  This file creates a global JSON object containing two methods: stringify
    //  and parse. This file provides the ES5 JSON capability to ES3 systems.
    //  If a project might run on IE8 or earlier, then this file should be included.
    //  This file does nothing on ES5 systems.

    //      JSON.stringify(value, replacer, space)
    //          value       any JavaScript value, usually an object or array.
    //          replacer    an optional parameter that determines how object
    //                      values are stringified for objects. It can be a
    //                      function or an array of strings.
    //          space       an optional parameter that specifies the indentation
    //                      of nested structures. If it is omitted, the text will
    //                      be packed without extra whitespace. If it is a number,
    //                      it will specify the number of spaces to indent at each
    //                      level. If it is a string (such as "\t" or "&nbsp;"),
    //                      it contains the characters used to indent at each level.
    //          This method produces a JSON text from a JavaScript value.
    //          When an object value is found, if the object contains a toJSON
    //          method, its toJSON method will be called and the result will be
    //          stringified. A toJSON method does not serialize: it returns the
    //          value represented by the name/value pair that should be serialized,
    //          or undefined if nothing should be serialized. The toJSON method
    //          will be passed the key associated with the value, and this will be
    //          bound to the value.

    //          For example, this would serialize Dates as ISO strings.

    //              Date.prototype.toJSON = function (key) {
    //                  function f(n) {
    //                      // Format integers to have at least two digits.
    //                      return (n < 10)
    //                          ? "0" + n
    //                          : n;
    //                  }
    //                  return this.getUTCFullYear()   + "-" +
    //                       f(this.getUTCMonth() + 1) + "-" +
    //                       f(this.getUTCDate())      + "T" +
    //                       f(this.getUTCHours())     + ":" +
    //                       f(this.getUTCMinutes())   + ":" +
    //                       f(this.getUTCSeconds())   + "Z";
    //              };

    //          You can provide an optional replacer method. It will be passed the
    //          key and value of each member, with this bound to the containing
    //          object. The value that is returned from your method will be
    //          serialized. If your method returns undefined, then the member will
    //          be excluded from the serialization.

    //          If the replacer parameter is an array of strings, then it will be
    //          used to select the members to be serialized. It filters the results
    //          such that only members with keys listed in the replacer array are
    //          stringified.

    //          Values that do not have JSON representations, such as undefined or
    //          functions, will not be serialized. Such values in objects will be
    //          dropped; in arrays they will be replaced with null. You can use
    //          a replacer function to replace those with JSON values.

    //          JSON.stringify(undefined) returns undefined.

    //          The optional space parameter produces a stringification of the
    //          value that is filled with line breaks and indentation to make it
    //          easier to read.

    //          If the space parameter is a non-empty string, then that string will
    //          be used for indentation. If the space parameter is a number, then
    //          the indentation will be that many spaces.

    //          Example:

    //          text = JSON.stringify(["e", {pluribus: "unum"}]);
    //          // text is '["e",{"pluribus":"unum"}]'

    //          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
    //          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

    //          text = JSON.stringify([new Date()], function (key, value) {
    //              return this[key] instanceof Date
    //                  ? "Date(" + this[key] + ")"
    //                  : value;
    //          });
    //          // text is '["Date(---current time---)"]'

    //      JSON.parse(text, reviver)
    //          This method parses a JSON text to produce an object or array.
    //          It can throw a SyntaxError exception.

    //          The optional reviver parameter is a function that can filter and
    //          transform the results. It receives each of the keys and values,
    //          and its return value is used instead of the original value.
    //          If it returns what it received, then the structure is not modified.
    //          If it returns undefined then the member is deleted.

    //          Example:

    //          // Parse the text. Values that look like ISO date strings will
    //          // be converted to Date objects.

    //          myData = JSON.parse(text, function (key, value) {
    //              var a;
    //              if (typeof value === "string") {
    //                  a =
    //   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    //                  if (a) {
    //                      return new Date(Date.UTC(
    //                         +a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]
    //                      ));
    //                  }
    //                  return value;
    //              }
    //          });

    //          myData = JSON.parse(
    //              "[\"Date(09/09/2001)\"]",
    //              function (key, value) {
    //                  var d;
    //                  if (
    //                      typeof value === "string"
    //                      && value.slice(0, 5) === "Date("
    //                      && value.slice(-1) === ")"
    //                  ) {
    //                      d = new Date(value.slice(5, -1));
    //                      if (d) {
    //                          return d;
    //                      }
    //                  }
    //                  return value;
    //              }
    //          );

    //  This is a reference implementation. You are free to copy, modify, or
    //  redistribute.

    /*jslint
        eval, for, this
    */

    /*property
        JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
        getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
        lastIndex, length, parse, prototype, push, replace, slice, stringify,
        test, toJSON, toString, valueOf
    */


    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.

    if (typeof JSON !== "object") {
        JSON = {};
    }
    ArkWindow.JSON = JSON;
    /* -- ark -- */

    (function() {

        var rx_one = /^[\],:{}\s]*$/;
        var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
        var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        function f(n) {
            // Format integers to have at least two digits.
            return (n < 10) ?
                "0" + n :
                n;
        }

        function this_value() {
            return this.valueOf();
        }

        if (typeof Date.prototype.toJSON !== "function") {

            Date.prototype.toJSON = function() {

                return isFinite(this.valueOf()) ?
                    (
                        this.getUTCFullYear() +
                        "-" +
                        f(this.getUTCMonth() + 1) +
                        "-" +
                        f(this.getUTCDate()) +
                        "T" +
                        f(this.getUTCHours()) +
                        ":" +
                        f(this.getUTCMinutes()) +
                        ":" +
                        f(this.getUTCSeconds()) +
                        "Z"
                    ) :
                    null;
            };

            Boolean.prototype.toJSON = this_value;
            Number.prototype.toJSON = this_value;
            String.prototype.toJSON = this_value;
        }

        var gap;
        var indent;
        var meta;
        var rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            rx_escapable.lastIndex = 0;
            return rx_escapable.test(string) ?
                "\"" + string.replace(rx_escapable, function(a) {
                    var c = meta[a];
                    return typeof c === "string" ?
                        c :
                        "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                }) + "\"" :
                "\"" + string + "\"";
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i; // The loop counter.
            var k; // The member key.
            var v; // The member value.
            var length;
            var mind = gap;
            var partial;
            var value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (
                value &&
                typeof value === "object" &&
                typeof value.toJSON === "function"
            ) {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === "function") {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
                case "string":
                    return quote(value);

                case "number":

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return (isFinite(value)) ?
                        String(value) :
                        "null";

                case "boolean":
                case "null":

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce "null". The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                    // If the type is "object", we might be dealing with an object or an array or
                    // null.

                case "object":

                    // Due to a specification blunder in ECMAScript, typeof null is "object",
                    // so watch out for that case.

                    if (!value) {
                        return "null";
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // Is the value an array?

                    if (Object.prototype.toString.apply(value) === "[object Array]") {

                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || "null";
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0 ?
                            "[]" :
                            gap ?
                            (
                                "[\n" +
                                gap +
                                partial.join(",\n" + gap) +
                                "\n" +
                                mind +
                                "]"
                            ) :
                            "[" + partial.join(",") + "]";
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === "object") {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === "string") {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (
                                        (gap) ?
                                        ": " :
                                        ":"
                                    ) + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (
                                        (gap) ?
                                        ": " :
                                        ":"
                                    ) + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0 ?
                        "{}" :
                        gap ?
                        "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
                        "{" + partial.join(",") + "}";
                    gap = mind;
                    return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== "function") {
            meta = { // table of character substitutions
                "\b": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                "\"": "\\\"",
                "\\": "\\\\"
            };
            JSON.stringify = function(value, replacer, space) {

                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.

                var i;
                gap = "";
                indent = "";

                // If the space parameter is a number, make an indent string containing that
                // many spaces.

                if (typeof space === "number") {
                    for (i = 0; i < space; i += 1) {
                        indent += " ";
                    }

                    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === "string") {
                    indent = space;
                }

                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== "function" && (
                        typeof replacer !== "object" ||
                        typeof replacer.length !== "number"
                    )) {
                    throw new Error("JSON.stringify");
                }

                // Make a fake root object containing our value under the key of "".
                // Return the result of stringifying the value.

                return str("", {
                    "": value
                });
            };
        }


        // If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== "function") {
            JSON.parse = function(text, reviver) {

                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.

                    var k;
                    var v;
                    var value = holder[key];
                    if (value && typeof value === "object") {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                rx_dangerous.lastIndex = 0;
                if (rx_dangerous.test(text)) {
                    text = text.replace(rx_dangerous, function(a) {
                        return (
                            "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                        );
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with "()" and "new"
                // because they can cause invocation, and "=" because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
                // replace all simple value tokens with "]" characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or "]" or
                // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

                if (
                    rx_one.test(
                        text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                    )
                ) {

                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.

                    j = eval("(" + text + ")");

                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.

                    return (typeof reviver === "function") ?
                        walk({
                            "": j
                        }, "") :
                        j;
                }

                // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError("JSON.parse");
            };
        }
    }());

    /**
     * 数据上报模块
     * 依赖 util.js
     */
    ArkWindow.report = {
        // 上报罗盘
        compass: function(data, table) {
            var http = Net.HttpRequest();
            var version = "";
            var os = arkWeb.System.GetOS();
            var uin = "";
            if (typeof QQ != "undefined" && QQ.GetVersion) {
                version = QQ.GetVersion();
            }
            if (typeof QQ != "undefined" && QQ.GetUIN) {
                uin = QQ.GetUIN();
            }
            var param = ArkWindow.util.extendOwn({
                uin: uin,
                touin: uin,
                appid: "",
                refer: "",
                actiontype: "",
                sub_actiontype: "",
                reserves_action: "",
                reserves2: "",
                reserves3: "",
                reserves4: "",
                device_platform: os,
                qqversion: version,
                timestamp: Date.now()
            }, data);

            ArkWindow.console.log("reportCompass Data");
            ArkWindow.console.log(param);

            var url = "https://h5.qzone.qq.com/report/compass/" + table + "?" + ArkWindow.util.toUrlParams(param);
            http.Get(url);
        }

    };

    var global$w = ArkWindow;
    (function(global) {

        var BEACON_HTTPS_URL = 'https://otheve.beacon.qq.com/analytics/v2_upload';

        var BEACON_STORE_PREFIX = "__BEACON_";
        var BEACON_DRIECT_LOG_ID_KEY = 'direct_log_id';

        var BEACON_STORE_PREFIX = "beaconV2_";
        var BEACON_U = "beacon_u";
        var BEACON_SDK_ID_HIPPY = 'js';
        var BEACON_SDK_VERSION = '4.3.0-web';
        var BEACON_PLATFORM_JS = 3;
        var EVENT_ID = 0;
        var START_A76 = (Date.now() + 100000).toString();
        var A88 = Date.now().toString();
        var SESSINO_ID = (Date.now() + 200000).toString();

        function ownKeys(object, enumerableOnly) {
            var keys = Object.keys(object);
            if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly)
                    symbols = symbols.filter(function(sym) {
                        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                    });
                keys.push.apply(keys, symbols);
            }
            return keys;
        }

        function _objectSpread(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                    ownKeys(Object(source), true).forEach(function(key) {
                        _defineProperty(target, key, source[key]);
                    });
                } else if (Object.getOwnPropertyDescriptors) {
                    Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                    ownKeys(Object(source)).forEach(function(key) {
                        Object.defineProperty(
                            target,
                            key,
                            Object.getOwnPropertyDescriptor(source, key)
                        );
                    });
                }
            }
            return target;
        }

        function _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, {
                    value: value,
                    enumerable: true,
                    configurable: true,
                    writable: true
                });
            } else {
                obj[key] = value;
            }
            return obj;
        }

        var replace = function(params) {
            var realParams = {};
            for (var key of Object.keys(params)) {
                var value = params[key];
                if (typeof value == "string") {
                    realParams[replaceSymbol(key)] = replaceSymbol(value);
                } else {
                    realParams[replaceSymbol(String(key))] = replaceSymbol(String(value));
                }
            }
            return realParams;
        };

        var replaceSymbol = function(value) {
            if (typeof value != "string") {
                return value;
            }
            try {
                return value
                    .replace(new RegExp("\\|", "g"), "%7C")
                    .replace(new RegExp("\\&", "g"), "%26")
                    .replace(new RegExp("\\=", "g"), "%3D")
                    .replace(new RegExp("\\+", "g"), "%2B");
            } catch (e) {
                ArkWindow.console.log(e);
                return "";
            }
        };

        var noop = function noop() {};
        var createPipeline = function(pipeArr) {
            if (!pipeArr || !pipeArr.reduce || !pipeArr.length) {
                throw new TypeError("createPipeline 方法需要传入至少有一个 pipe 的数组");
            }

            if (pipeArr.length === 1) {
                return function(msg, resolve) {
                    pipeArr[0](msg, resolve || noop);
                };
            } else {
                return pipeArr.reduce(function(prePipe, pipe) {
                    return function(msg) {
                        var nextPipe =
                            arguments.length > 1 && arguments[1] !== undefined ?
                            arguments[1] :
                            noop;
                        return prePipe(msg, function(msg) {
                            return pipe === null || pipe === void 0 ?
                                void 0 :
                                pipe(msg, nextPipe);
                        });
                    };
                });
            }
        };

        global.BeaconAction = function(opts) {
            var _this = this;

            var getRandom = function(count) {
                var a = (Date.now() * 1e6 + Math.floor(Math.random() * 1e6)).toString(count);
                return a || "";
            };

            var getStoreKey = function(key) {
                return BEACON_STORE_PREFIX + '_' + _this.config.appkey + '_' + key;
            };

            var getItem = function(key) {
                try {
                    return arkWeb.Storage.Load(getStoreKey(key));
                } catch (e) {
                    return "";
                }
            };

            var setItem = function(key, value) {
                try {
                    arkWeb.Storage.Save(getStoreKey(key), value);
                } catch (e) {}
            };

            var createDeviceId = function() {
                var deviceId = getItem(BEACON_U);
                if (!deviceId || deviceId === "") {
                    deviceId = getRandom(36);
                    setItem(BEACON_U, deviceId);
                }
                return deviceId;
            };

            this.config = {
                appkey: opts.appKey,
                appVersion: opts.versionCode ? String(opts.versionCode) : '',
                strictMode: true,
            };

            this.commonInfo = {
                deviceId: createDeviceId(),
                language: '',
                query: '',
                userAgent: '',
                pixel: '',
                channelID: opts.channelID ? String(opts.channelID) : '',
                openid: opts.openid ? String(opts.openid) : '',
                unid: opts.unionid ? String(opts.unionid) : '',
                sdkVersion: BEACON_SDK_VERSION,
            };
            this.config.strictMode = opts.strictMode;

            this.config = Object.assign(this.config, opts);
            ArkWindow.console.log('config: ' + JSON.stringify(this.config));

            var send = function(data, success, fail) {
                // console.warn('report data', data);

                ArkWindow.http.post(BEACON_HTTPS_URL + "?appkey=" + _this.config.appkey, {
                    'Content-Type': 'application/json'
                }, data, function(response) {
                    ArkWindow.console.log("send response: " + JSON.stringify(response));
                    if (response && response.msg !== "success") {
                        if (fail && (typeof fail === "function")) {
                            fail(JSON.stringify(data.events));
                        }
                        return;
                    }
                    if (success && (typeof success === "function")) {
                        success(JSON.stringify(data.events));
                    }
                });
            };

            var _normalLogPipeline = createPipeline([
                function(logs) {
                    send(logs, _this.config.onReportSuccess, _this.config.onReportFail);
                }
            ]);

            var assembleData = function(events) {
                if (events.length == 0) {
                    return;
                }
                var body = {
                    appVersion: _this.config.appVersion ? replaceSymbol(_this.config.appVersion) : '',
                    sdkId: BEACON_SDK_ID_HIPPY,
                    mainAppKey: _this.config.appkey,
                    platformId: BEACON_PLATFORM_JS,
                    sdkVersion: BEACON_SDK_VERSION,
                    common: replace({
                        A12: "zh-CN",
                        A2: _this.commonInfo.deviceId,
                        A8: String(_this.commonInfo.openid),
                        A23: _this.commonInfo.channelID,
                        A50: String(_this.commonInfo.unid),
                        A76: _this.config.appkey + '_' + START_A76,
                    }),
                    events: events,
                };
                _normalLogPipeline(body);
            };

            var onReport = function(eventCode, params, isRealEvent) {
                if (!isRealEvent) {
                    throw new Error("hippy SDK 不支持非实时事件!");
                }

                var events = [];
                var logid = Number(getItem(BEACON_DRIECT_LOG_ID_KEY));
                logid = logid ? logid : 1;
                var oriUdf = JSON.parse(opts.udfKv);
                oriUdf.eid = params.dt_eid;
                var temUdfKv = JSON.stringify(oriUdf);
                var udfKv = eventCode != 'dt_clck' ? opts.udfKv : temUdfKv;
                params = _objectSpread(
                    _objectSpread({}, params), {}, {
                        A100: logid + '',
                        dt_qq_h5: (QQ && QQ.GetUIN) ? QQ.GetUIN() : '',
                        dt_pgstp: "1",
                        dt_pgid: opts.pageId,
                        dt_sdkversion_h5: "3.1.6",
                        target_sdk: "11",
                        dt_sessionid_h5: SESSINO_ID,
                        A72: "4.3.0-web",
                        A88: A88,
                        dt_eventid_h5: EVENT_ID + '',
                        udf_kv: udfKv
                    }
                );
                logid++;
                EVENT_ID++;
                params.A99 = params.A99 ? params.A99 : "Y";
                setItem(BEACON_DRIECT_LOG_ID_KEY, String(logid));
                events.push({
                    eventCode: eventCode,
                    eventTime: Date.now().toString(),
                    mapValue: replace(params, _this.config.strictMode)
                });
                assembleData(events);
            };

            this.preReport = function(eventCode, params, isRealEvent) {
                if (!eventCode) {
                    return;
                }
                onReport(eventCode, params, isRealEvent);
            };

        };

        global.BeaconAction.prototype = {
            onDirectUserAction: function(eventCode, params) {
                ArkWindow.console.log(eventCode);
                ArkWindow.console.log(JSON.stringify(params));
                this.preReport(eventCode, params, true);
            },
        };

    })(global$w);

    var global$v = ArkWindow;
    (function(global) {

        var parseContent = function(contents, guild) {
            var dataArr = [];
            ArkWindow.console.log('parseContent content');
            ArkWindow.console.log(contents);
            var ContentType = {
                // 文本
                TEXT: 1,
                // @成员
                LINK_MEMBER: 2,
                // url链接
                LINK_HREF: 3,
                // 表情图片
                INLINE_IMG: 4,
                // 频道链接
                LINK_CHANNEL: 5,
                // 话题
                TOPIC_CONTENT: 8,
                // 群组
                GROUP_CONTENT: 9
            };
            contents.forEach(function(item) {
                var type = item.type;
                if (type === 1 && item.text_content) {
                    dataArr.push({
                        isText: true,
                        text: item.text_content.text
                    });
                    return;
                }

                if (type === 2 && item.at_content) {
                    var atType = item.at_content.type;
                    var atContent = item.at_content;
                    if (atType === 1 && atContent.user) {
                        dataArr.push({
                            isLinkMember: true,
                            text: atContent.user.nick
                        });
                        return;
                    }
                    if (atType === 2 && atContent.role_group_id) {
                        dataArr.push({
                            isLinkGuild: true,
                            text: atContent.role_group_id.name
                        });
                        return;
                    }
                    if (atType === 3 && atContent.guild_info) {

                        var targetGuildId = atContent.guild_info.guild_id + '';

                        ArkWindow.console.time(targetGuildId + ':' + guild);
                        if (targetGuildId === guild) {
                            dataArr.push({
                                isLinkMember: true,
                                text: '全体成员'
                            });
                            ArkWindow.console.time('isAtall');
                            return;
                        }

                        if (atContent.guild_info.name === '全体成员') {
                            dataArr.push({
                                isLinkMember: true,
                                text: '全体成员'
                            });
                            return;
                        }

                        dataArr.push({
                            isLinkGuild: true,
                            text: atContent.guild_info.name
                        });
                        return;
                    }
                }

                if (type === 3 && item.url_content) {
                    dataArr.push({
                        isUrl: true,
                        text: item.url_content.display_text
                    });
                    return;
                }

                if (type === 4 && item.emoji_content) {
                    var id = item.emoji_content.id;
                    var url = item.emoji_content.url;
                    dataArr.push({
                        isImage: true,
                        url: url,
                        id: id,
                    });
                    return;
                }

                if (item.channel_content) {
                    var data = item.channel_content.channel_info;
                    dataArr.push({
                        isLinkGuild: true,
                        text: data.name,
                        channelType: data.sign ? data.sign.channel_type : -1,
                    });
                    return;
                }

                if (type === ContentType.TOPIC_CONTENT && item.topic_content) {
                    var data = item.topic_content;
                    dataArr.push({
                        isTopic: true,
                        text: data.topic_name || ''
                    });
                    return
                }

                if (type === ContentType.GROUP_CONTENT && item.group_content) {
                    var data = item.group_content;
                    dataArr.push({
                        isGroup: true,
                        text: data.group_name || '',
                        groupCode: data.group_code || ''
                    });
                    return
                }
            });

            return dataArr;
        };

        var parseFeed = function(stFeed, guildId) {
            stFeed.images;
            stFeed.videos;
            var feedContents = [];
            if (stFeed.contents && stFeed.contents.contents) {
                feedContents = stFeed.contents.contents;
            }
            var title = [];
            if (stFeed.title && stFeed.title.contents) {
                title = stFeed.title.contents;
            }
            // var contents = title.concat(feedContents);
            // if (!stFeed.pattern_info) {
            var titleData = {
                data: [{
                    isText: true,
                    text: title[0] && title[0].text_content && title[0].text_content.text ? title[0].text_content.text : ''
                }]
            };
            const data = parseContent(feedContents, guildId);
            var dataArray = [titleData, {
                data: data
            }];
            return dataArray;
            // }
            // var richDataFormats = JSON.parse(stFeed.pattern_info);
            // var richDataFormatData = richDataFormats.map(function (richDataFormat, index) {
            //     if (richDataFormat.type === 'blockParagraph' || richDataFormat.type === 'paragraph') {
            //         return parseRichTextData(contents, richDataFormat, guildId);
            //     }
            //     return { data: [], isText: true };
            // });
            // return richDataFormatData;
        };
        var parseFeedComment = function(comments, guildId) {
            var RichContentType = {
                TEXT: 1,
                AT_CONTENT: 2,
                URL_CONTENT: 3,
                EMOJI_CONTENT: 4,
                CHANNEL_CONTENT: 5,
            };
            if (!comments || !comments.contents) {
                return [];
            }
            var contents = comments.contents;

            var parseData = contents.map(function(comment) {
                var type = comment.type;
                if (type == RichContentType.TEXT) {
                    var text = comment.text_content.text;
                    return {
                        isText: true,
                        text: text
                    }
                }

                if (type == RichContentType.URL_CONTENT) {
                    var url = comment.url_content.url;
                    var text = comment.url_content.display_text;
                    return {
                        isUrl: true,
                        text: text,
                    }
                }

                if (type == RichContentType.EMOJI_CONTENT) {
                    var url = comment.emoji_content.url;
                    var id = comment.emoji_content.id;
                    return {
                        isImage: true,
                        url: url,
                        id: id,
                    }
                }

                if (type === RichContentType.AT_CONTENT) {
                    var atType = comment.at_content.type;
                    var guild_info = comment.at_content.guild_info;
                    var role_group = comment.at_content.role_group_id;
                    var user = comment.at_content.user;

                    if (atType === 1) {
                        return {
                            isLinkMember: true,
                            text: user.nick
                        }
                    }

                    if (atType === 3) {
                        if (!guild_info) {
                            return {
                                isLinkGuild: true,
                                text: '',
                            }
                        }
                        if (guild_info && guildId === (guild_info.guild_id + '')) {
                            return {
                                isLinkMember: true,
                                text: '全体成员',
                            }
                        }
                        return {
                            isLinkGuild: true,
                            text: guild_info.name,
                        }
                    }

                    if (atType === 2) {
                        return {
                            isLinkGuild: true,
                            text: role_group.name,
                        }
                    }
                }

                if (type === RichContentType.CHANNEL_CONTENT) {
                    var channel = comment.channel_content;
                    if (chanel && channel.channel_info) {
                        return {
                            isLinkGuild: true,
                            text: channel.channel_info.name,
                            channelType: channel_info.sign ? channel_info.sign.channel_type : -1,
                        }
                    }
                    return {
                        isText: true,
                        text: '',
                        channelType: -1,
                    }
                }

            });

            return parseData;
        };

        global.parseFeedComment = parseFeedComment;
        global.parseFeed = parseFeed;
    })(global$v);

    var global$u = ArkWindow;
    (function(global) {
        var emojiConfig = {
            "sysface": [{
                    "QSid": "14",
                    "QDes": "/微笑",
                    "IQLid": "23",
                    "AQLid": "23",
                    "EMCode": "100"
                },
                {
                    "QSid": "1",
                    "QDes": "/撇嘴",
                    "IQLid": "40",
                    "AQLid": "40",
                    "EMCode": "101"
                },
                {
                    "QSid": "2",
                    "QDes": "/色",
                    "IQLid": "19",
                    "AQLid": "19",
                    "EMCode": "102"
                },
                {
                    "QSid": "3",
                    "QDes": "/发呆",
                    "IQLid": "43",
                    "AQLid": "43",
                    "EMCode": "103"
                },
                {
                    "QSid": "4",
                    "QDes": "/得意",
                    "IQLid": "21",
                    "AQLid": "21",
                    "EMCode": "104"
                },
                {
                    "QSid": "6",
                    "QDes": "/害羞",
                    "IQLid": "20",
                    "AQLid": "20",
                    "EMCode": "106"
                },
                {
                    "QSid": "7",
                    "QDes": "/闭嘴",
                    "IQLid": "104",
                    "AQLid": "106",
                    "EMCode": "107"
                },
                {
                    "QSid": "8",
                    "QDes": "/睡",
                    "IQLid": "35",
                    "AQLid": "35",
                    "EMCode": "108"
                },
                {
                    "QSid": "9",
                    "QDes": "/大哭",
                    "IQLid": "10",
                    "AQLid": "10",
                    "EMCode": "109"
                },
                {
                    "QSid": "5",
                    "QDes": "/流泪",
                    "IQLid": "9",
                    "AQLid": "9",
                    "EMCode": "105",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "16"
                },
                {
                    "QSid": "10",
                    "QDes": "/尴尬",
                    "IQLid": "25",
                    "AQLid": "25",
                    "EMCode": "110"
                },
                {
                    "QSid": "11",
                    "QDes": "/发怒",
                    "IQLid": "24",
                    "AQLid": "24",
                    "EMCode": "111"
                },
                {
                    "QSid": "12",
                    "QDes": "/调皮",
                    "IQLid": "1",
                    "AQLid": "1",
                    "EMCode": "112"
                },
                {
                    "QSid": "13",
                    "QDes": "/呲牙",
                    "IQLid": "0",
                    "AQLid": "0",
                    "EMCode": "113"
                },
                {
                    "QSid": "0",
                    "QDes": "/惊讶",
                    "IQLid": "33",
                    "AQLid": "33",
                    "EMCode": "114"
                },
                {
                    "QSid": "15",
                    "QDes": "/难过",
                    "IQLid": "32",
                    "AQLid": "32",
                    "EMCode": "115"
                },
                {
                    "QSid": "16",
                    "QDes": "/酷",
                    "IQLid": "12",
                    "AQLid": "12",
                    "EMCode": "116"
                },
                {
                    "QSid": "96",
                    "QDes": "/冷汗",
                    "IQLid": "27",
                    "AQLid": "27",
                    "EMCode": "117"
                },
                {
                    "QSid": "18",
                    "QDes": "/抓狂",
                    "IQLid": "13",
                    "AQLid": "13",
                    "EMCode": "118"
                },
                {
                    "QSid": "19",
                    "QDes": "/吐",
                    "IQLid": "22",
                    "AQLid": "22",
                    "EMCode": "119"
                },
                {
                    "QSid": "20",
                    "QDes": "/偷笑",
                    "IQLid": "3",
                    "AQLid": "3",
                    "EMCode": "120"
                },
                {
                    "QSid": "21",
                    "QDes": "/可爱",
                    "IQLid": "18",
                    "AQLid": "18",
                    "EMCode": "121"
                },
                {
                    "QSid": "22",
                    "QDes": "/白眼",
                    "IQLid": "30",
                    "AQLid": "30",
                    "EMCode": "122"
                },
                {
                    "QSid": "23",
                    "QDes": "/傲慢",
                    "IQLid": "31",
                    "AQLid": "31",
                    "EMCode": "123"
                },
                {
                    "QSid": "24",
                    "QDes": "/饥饿",
                    "IQLid": "79",
                    "AQLid": "81",
                    "EMCode": "124"
                },
                {
                    "QSid": "25",
                    "QDes": "/困",
                    "IQLid": "80",
                    "AQLid": "82",
                    "EMCode": "125"
                },
                {
                    "QSid": "26",
                    "QDes": "/惊恐",
                    "IQLid": "26",
                    "AQLid": "26",
                    "EMCode": "126"
                },
                {
                    "QSid": "27",
                    "QDes": "/流汗",
                    "IQLid": "2",
                    "AQLid": "2",
                    "EMCode": "127"
                },
                {
                    "QSid": "28",
                    "QDes": "/憨笑",
                    "IQLid": "37",
                    "AQLid": "37",
                    "EMCode": "128"
                },
                {
                    "QSid": "29",
                    "QDes": "/悠闲",
                    "IQLid": "50",
                    "AQLid": "50",
                    "EMCode": "129"
                },
                {
                    "QSid": "30",
                    "QDes": "/奋斗",
                    "IQLid": "42",
                    "AQLid": "42",
                    "EMCode": "130"
                },
                {
                    "QSid": "31",
                    "QDes": "/咒骂",
                    "IQLid": "81",
                    "AQLid": "83",
                    "EMCode": "131"
                },
                {
                    "QSid": "32",
                    "QDes": "/疑问",
                    "IQLid": "34",
                    "AQLid": "34",
                    "EMCode": "132"
                },
                {
                    "QSid": "33",
                    "QDes": "/嘘",
                    "IQLid": "11",
                    "AQLid": "11",
                    "EMCode": "133"
                },
                {
                    "QSid": "34",
                    "QDes": "/晕",
                    "IQLid": "49",
                    "AQLid": "49",
                    "EMCode": "134"
                },
                {
                    "QSid": "35",
                    "QDes": "/折磨",
                    "IQLid": "82",
                    "AQLid": "84",
                    "EMCode": "135"
                },
                {
                    "QSid": "36",
                    "QDes": "/衰",
                    "isStatic": "1",
                    "IQLid": "39",
                    "AQLid": "39",
                    "EMCode": "136"
                },
                {
                    "QSid": "37",
                    "QDes": "/骷髅",
                    "isStatic": "1",
                    "IQLid": "76",
                    "AQLid": "78",
                    "EMCode": "137"
                },
                {
                    "QSid": "38",
                    "QDes": "/敲打",
                    "IQLid": "5",
                    "AQLid": "5",
                    "EMCode": "138"
                },
                {
                    "QSid": "39",
                    "QDes": "/再见",
                    "IQLid": "4",
                    "AQLid": "4",
                    "EMCode": "139"
                },
                {
                    "QSid": "97",
                    "QDes": "/擦汗",
                    "IQLid": "6",
                    "AQLid": "6",
                    "EMCode": "140"
                },
                {
                    "QSid": "98",
                    "QDes": "/抠鼻",
                    "IQLid": "83",
                    "AQLid": "85",
                    "EMCode": "141"
                },
                {
                    "QSid": "99",
                    "QDes": "/鼓掌",
                    "IQLid": "84",
                    "AQLid": "86",
                    "EMCode": "142"
                },
                {
                    "QSid": "100",
                    "QDes": "/糗大了",
                    "IQLid": "85",
                    "AQLid": "87",
                    "EMCode": "143"
                },
                {
                    "QSid": "101",
                    "QDes": "/坏笑",
                    "IQLid": "46",
                    "AQLid": "46",
                    "EMCode": "144"
                },
                {
                    "QSid": "102",
                    "QDes": "/左哼哼",
                    "IQLid": "86",
                    "AQLid": "88",
                    "EMCode": "145"
                },
                {
                    "QSid": "103",
                    "QDes": "/右哼哼",
                    "IQLid": "44",
                    "AQLid": "44",
                    "EMCode": "146"
                },
                {
                    "QSid": "104",
                    "QDes": "/哈欠",
                    "IQLid": "87",
                    "AQLid": "89",
                    "EMCode": "147"
                },
                {
                    "QSid": "105",
                    "QDes": "/鄙视",
                    "IQLid": "48",
                    "AQLid": "48",
                    "EMCode": "148"
                },
                {
                    "QSid": "106",
                    "QDes": "/委屈",
                    "IQLid": "14",
                    "AQLid": "14",
                    "EMCode": "149"
                },
                {
                    "QSid": "107",
                    "QDes": "/快哭了",
                    "IQLid": "88",
                    "AQLid": "90",
                    "EMCode": "150"
                },
                {
                    "QSid": "108",
                    "QDes": "/阴险",
                    "IQLid": "41",
                    "AQLid": "41",
                    "EMCode": "151"
                },
                {
                    "QSid": "305",
                    "QDes": "/右亲亲",
                    "IQLid": "305",
                    "AQLid": "305",
                    "EMCode": "10305"
                },
                {
                    "QSid": "109",
                    "QDes": "/左亲亲",
                    "IQLid": "36",
                    "AQLid": "36",
                    "EMCode": "152"
                },
                {
                    "QSid": "110",
                    "QDes": "/吓",
                    "IQLid": "89",
                    "AQLid": "91",
                    "EMCode": "153"
                },
                {
                    "QSid": "111",
                    "QDes": "/可怜",
                    "IQLid": "51",
                    "AQLid": "51",
                    "EMCode": "154"
                },
                {
                    "QSid": "172",
                    "QDes": "/眨眼睛",
                    "IQLid": "142",
                    "AQLid": "164",
                    "EMCode": "242"
                },
                {
                    "QSid": "182",
                    "QDes": "/笑哭",
                    "IQLid": "152",
                    "AQLid": "174",
                    "EMCode": "252"
                },
                {
                    "QSid": "179",
                    "QDes": "/doge",
                    "IQLid": "149",
                    "AQLid": "171",
                    "EMCode": "249"
                },
                {
                    "QSid": "173",
                    "QDes": "/泪奔",
                    "IQLid": "143",
                    "AQLid": "165",
                    "EMCode": "243"
                },
                {
                    "QSid": "174",
                    "QDes": "/无奈",
                    "IQLid": "144",
                    "AQLid": "166",
                    "EMCode": "244"
                },
                {
                    "QSid": "212",
                    "QDes": "/托腮",
                    "IQLid": "182",
                    "AQLid": "161",
                    "EMCode": "282"
                },
                {
                    "QSid": "175",
                    "QDes": "/卖萌",
                    "IQLid": "145",
                    "AQLid": "167",
                    "EMCode": "245"
                },
                {
                    "QSid": "178",
                    "QDes": "/斜眼笑",
                    "IQLid": "148",
                    "AQLid": "170",
                    "EMCode": "248"
                },
                {
                    "QSid": "177",
                    "QDes": "/喷血",
                    "IQLid": "147",
                    "AQLid": "169",
                    "EMCode": "247"
                },
                {
                    "QSid": "180",
                    "QDes": "/惊喜",
                    "IQLid": "150",
                    "AQLid": "172",
                    "EMCode": "250"
                },
                {
                    "QSid": "181",
                    "QDes": "/骚扰",
                    "IQLid": "151",
                    "AQLid": "173",
                    "EMCode": "251"
                },
                {
                    "QSid": "176",
                    "QDes": "/小纠结",
                    "IQLid": "146",
                    "AQLid": "168",
                    "EMCode": "246"
                },
                {
                    "QSid": "183",
                    "QDes": "/我最美",
                    "IQLid": "153",
                    "AQLid": "175",
                    "EMCode": "253"
                },
                {
                    "QSid": "245",
                    "QDes": "/加油必胜",
                    "IQLid": "245",
                    "AQLid": "217",
                    "QHide": "1",
                    "EMCode": "202001"
                },
                {
                    "QSid": "246",
                    "QDes": "/加油抱抱",
                    "IQLid": "246",
                    "AQLid": "218",
                    "EMCode": "202002"
                },
                {
                    "QSid": "247",
                    "QDes": "/口罩护体",
                    "isStatic": "1",
                    "IQLid": "247",
                    "AQLid": "219",
                    "QHide": "1",
                    "EMCode": "202003"
                },
                {
                    "QSid": "260",
                    "QDes": "/搬砖中",
                    "isStatic": "1",
                    "IQLid": "260",
                    "AQLid": "260",
                    "QHide": "1",
                    "EMCode": "10260"
                },
                {
                    "QSid": "261",
                    "QDes": "/忙到飞起",
                    "IQLid": "261",
                    "AQLid": "261",
                    "QHide": "1",
                    "EMCode": "10261"
                },
                {
                    "QSid": "262",
                    "QDes": "/脑阔疼",
                    "IQLid": "262",
                    "AQLid": "262",
                    "EMCode": "10262"
                },
                {
                    "QSid": "263",
                    "QDes": "/沧桑",
                    "IQLid": "263",
                    "AQLid": "263",
                    "EMCode": "10263"
                },
                {
                    "QSid": "264",
                    "QDes": "/捂脸",
                    "IQLid": "264",
                    "AQLid": "264",
                    "EMCode": "10264"
                },
                {
                    "QSid": "265",
                    "QDes": "/辣眼睛",
                    "IQLid": "265",
                    "AQLid": "265",
                    "EMCode": "10265"
                },
                {
                    "QSid": "266",
                    "QDes": "/哦哟",
                    "IQLid": "266",
                    "AQLid": "266",
                    "EMCode": "10266"
                },
                {
                    "QSid": "267",
                    "QDes": "/头秃",
                    "IQLid": "267",
                    "AQLid": "267",
                    "EMCode": "10267"
                },
                {
                    "QSid": "268",
                    "QDes": "/问号脸",
                    "IQLid": "268",
                    "AQLid": "268",
                    "EMCode": "10268"
                },
                {
                    "QSid": "269",
                    "QDes": "/暗中观察",
                    "IQLid": "269",
                    "AQLid": "269",
                    "EMCode": "10269"
                },
                {
                    "QSid": "270",
                    "QDes": "/emm",
                    "IQLid": "270",
                    "AQLid": "270",
                    "EMCode": "10270"
                },
                {
                    "QSid": "271",
                    "QDes": "/吃瓜",
                    "IQLid": "271",
                    "AQLid": "271",
                    "EMCode": "10271"
                },
                {
                    "QSid": "272",
                    "QDes": "/呵呵哒",
                    "IQLid": "272",
                    "AQLid": "272",
                    "EMCode": "10272"
                },
                {
                    "QSid": "277",
                    "QDes": "/汪汪",
                    "isStatic": "1",
                    "IQLid": "277",
                    "AQLid": "277",
                    "EMCode": "10277"
                },
                {
                    "QSid": "307",
                    "QDes": "/喵喵",
                    "isStatic": "1",
                    "IQLid": "307",
                    "AQLid": "307",
                    "EMCode": "10307"
                },
                {
                    "QSid": "306",
                    "QDes": "/牛气冲天",
                    "isStatic": "1",
                    "IQLid": "306",
                    "AQLid": "306",
                    "EMCode": "10306"
                },
                {
                    "QSid": "281",
                    "QDes": "/无眼笑",
                    "IQLid": "281",
                    "AQLid": "281",
                    "EMCode": "10281"
                },
                {
                    "QSid": "282",
                    "QDes": "/敬礼",
                    "IQLid": "282",
                    "AQLid": "282",
                    "EMCode": "10282"
                },
                {
                    "QSid": "283",
                    "QDes": "/狂笑",
                    "IQLid": "283",
                    "AQLid": "283",
                    "EMCode": "10283"
                },
                {
                    "QSid": "284",
                    "QDes": "/面无表情",
                    "IQLid": "284",
                    "AQLid": "284",
                    "EMCode": "10284"
                },
                {
                    "QSid": "285",
                    "QDes": "/摸鱼",
                    "IQLid": "285",
                    "AQLid": "285",
                    "EMCode": "10285"
                },
                {
                    "QSid": "293",
                    "QDes": "/摸锦鲤",
                    "IQLid": "293",
                    "AQLid": "293",
                    "EMCode": "10293"
                },
                {
                    "QSid": "286",
                    "QDes": "/魔鬼笑",
                    "IQLid": "286",
                    "AQLid": "286",
                    "EMCode": "10286"
                },
                {
                    "QSid": "287",
                    "QDes": "/哦",
                    "IQLid": "287",
                    "AQLid": "287",
                    "EMCode": "10287"
                },
                {
                    "QSid": "288",
                    "QDes": "/请",
                    "IQLid": "288",
                    "AQLid": "288",
                    "EMCode": "10288"
                },
                {
                    "QSid": "289",
                    "QDes": "/睁眼",
                    "IQLid": "289",
                    "AQLid": "289",
                    "EMCode": "10289"
                },
                {
                    "QSid": "294",
                    "QDes": "/期待",
                    "IQLid": "294",
                    "AQLid": "294",
                    "EMCode": "10294"
                },
                {
                    "QSid": "295",
                    "QDes": "/拿到红包",
                    "IQLid": "295",
                    "AQLid": "295",
                    "QHide": "1",
                    "EMCode": "10295"
                },
                {
                    "QSid": "296",
                    "QDes": "/真好",
                    "IQLid": "296",
                    "AQLid": "296",
                    "QHide": "1",
                    "EMCode": "10296"
                },
                {
                    "QSid": "297",
                    "QDes": "/拜谢",
                    "IQLid": "297",
                    "AQLid": "297",
                    "EMCode": "10297"
                },
                {
                    "QSid": "298",
                    "QDes": "/元宝",
                    "IQLid": "298",
                    "AQLid": "298",
                    "EMCode": "10298"
                },
                {
                    "QSid": "299",
                    "QDes": "/牛啊",
                    "IQLid": "299",
                    "AQLid": "299",
                    "EMCode": "10299"
                },
                {
                    "QSid": "300",
                    "QDes": "/胖三斤",
                    "IQLid": "300",
                    "AQLid": "300",
                    "EMCode": "10300"
                },
                {
                    "QSid": "301",
                    "QDes": "/好闪",
                    "IQLid": "301",
                    "AQLid": "301",
                    "EMCode": "10301"
                },
                {
                    "QSid": "303",
                    "QDes": "/右拜年",
                    "IQLid": "303",
                    "AQLid": "303",
                    "QHide": "1",
                    "EMCode": "10303"
                },
                {
                    "QSid": "302",
                    "QDes": "/左拜年",
                    "IQLid": "302",
                    "AQLid": "302",
                    "QHide": "1",
                    "EMCode": "10302"
                },
                {
                    "QSid": "304",
                    "QDes": "/红包包",
                    "IQLid": "304",
                    "AQLid": "304",
                    "QHide": "1",
                    "EMCode": "10304"
                },
                {
                    "QSid": "322",
                    "QDes": "/拒绝",
                    "IQLid": "322",
                    "AQLid": "322",
                    "EMCode": "10322"
                },
                {
                    "QSid": "323",
                    "QDes": "/嫌弃",
                    "IQLid": "323",
                    "AQLid": "323",
                    "EMCode": "10323"
                },
                {
                    "QSid": "311",
                    "QDes": "/打call",
                    "IQLid": "311",
                    "AQLid": "311",
                    "EMCode": "10311",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "1"
                },
                {
                    "QSid": "312",
                    "QDes": "/变形",
                    "IQLid": "312",
                    "AQLid": "312",
                    "EMCode": "10312",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "2"
                },
                {
                    "QSid": "313",
                    "QDes": "/嗑到了",
                    "IQLid": "313",
                    "AQLid": "313",
                    "QHide": "1",
                    "EMCode": "10313",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "3"
                },
                {
                    "QSid": "314",
                    "QDes": "/仔细分析",
                    "IQLid": "314",
                    "AQLid": "314",
                    "EMCode": "10314",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "4"
                },
                {
                    "QSid": "315",
                    "QDes": "/加油",
                    "IQLid": "315",
                    "AQLid": "315",
                    "EMCode": "10315",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "5"
                },
                {
                    "QSid": "316",
                    "QDes": "/我没事",
                    "IQLid": "316",
                    "AQLid": "316",
                    "QHide": "1",
                    "EMCode": "10316",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "6"
                },
                {
                    "QSid": "317",
                    "QDes": "/菜汪",
                    "IQLid": "317",
                    "AQLid": "317",
                    "EMCode": "10317",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "7"
                },
                {
                    "QSid": "318",
                    "QDes": "/崇拜",
                    "IQLid": "318",
                    "AQLid": "318",
                    "EMCode": "10318",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "8"
                },
                {
                    "QSid": "319",
                    "QDes": "/比心",
                    "IQLid": "319",
                    "AQLid": "319",
                    "EMCode": "10319",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "9"
                },
                {
                    "QSid": "320",
                    "QDes": "/庆祝",
                    "IQLid": "320",
                    "AQLid": "320",
                    "EMCode": "10320",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "10"
                },
                {
                    "QSid": "321",
                    "QDes": "/老色痞",
                    "IQLid": "321",
                    "AQLid": "321",
                    "QHide": "1",
                    "EMCode": "10321",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "11"
                },
                {
                    "QSid": "324",
                    "QDes": "/吃糖",
                    "IQLid": "324",
                    "AQLid": "324",
                    "EMCode": "10324",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "12"
                },
                {
                    "QSid": "325",
                    "QDes": "/惊吓",
                    "IQLid": "325",
                    "AQLid": "325",
                    "EMCode": "10325",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "14"
                },
                {
                    "QSid": "326",
                    "QDes": "/生气",
                    "IQLid": "326",
                    "AQLid": "326",
                    "EMCode": "10326",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "15"
                },
                {
                    "QSid": "53",
                    "QDes": "/蛋糕",
                    "IQLid": "59",
                    "AQLid": "59",
                    "EMCode": "168",
                    "AniStickerType": 1,
                    "AniStickerPackId": "1",
                    "AniStickerId": "17"
                },
                {
                    "QSid": "114",
                    "QDes": "/篮球",
                    "IQLid": "90",
                    "AQLid": "92",
                    "EMCode": "158",
                    "AniStickerType": 2,
                    "AniStickerPackId": "1",
                    "AniStickerId": "13"
                },
                {
                    "QSid": "49",
                    "QDes": "/拥抱",
                    "IQLid": "45",
                    "AQLid": "45",
                    "EMCode": "178"
                },
                {
                    "QSid": "66",
                    "QDes": "/爱心",
                    "isStatic": "1",
                    "IQLid": "28",
                    "AQLid": "28",
                    "EMCode": "166"
                },
                {
                    "QSid": "63",
                    "QDes": "/玫瑰",
                    "isStatic": "1",
                    "IQLid": "8",
                    "AQLid": "8",
                    "EMCode": "163"
                },
                {
                    "QSid": "64",
                    "QDes": "/凋谢",
                    "isStatic": "1",
                    "IQLid": "57",
                    "AQLid": "57",
                    "EMCode": "164"
                },
                {
                    "QSid": "187",
                    "QDes": "/幽灵",
                    "IQLid": "157",
                    "AQLid": "179",
                    "EMCode": "257"
                },
                {
                    "QSid": "146",
                    "QDes": "/爆筋",
                    "isStatic": "1",
                    "IQLid": "116",
                    "AQLid": "118",
                    "EMCode": "121011"
                },
                {
                    "QSid": "116",
                    "QDes": "/示爱",
                    "IQLid": "29",
                    "AQLid": "29",
                    "EMCode": "165"
                },
                {
                    "QSid": "67",
                    "QDes": "/心碎",
                    "IQLid": "72",
                    "AQLid": "74",
                    "EMCode": "167"
                },
                {
                    "QSid": "60",
                    "QDes": "/咖啡",
                    "IQLid": "66",
                    "AQLid": "66",
                    "EMCode": "160"
                },
                {
                    "QSid": "185",
                    "QDes": "/羊驼",
                    "IQLid": "155",
                    "AQLid": "177",
                    "EMCode": "255"
                },
                {
                    "QSid": "192",
                    "QDes": "/红包",
                    "IQLid": "162",
                    "AQLid": "184",
                    "QHide": "1",
                    "EMCode": "262"
                },
                {
                    "QSid": "137",
                    "QDes": "/鞭炮",
                    "isStatic": "1",
                    "IQLid": "107",
                    "AQLid": "109",
                    "EMCode": "121002"
                },
                {
                    "QSid": "138",
                    "QDes": "/灯笼",
                    "isStatic": "1",
                    "IQLid": "108",
                    "AQLid": "110",
                    "QHide": "1",
                    "EMCode": "121003"
                },
                {
                    "QSid": "136",
                    "QDes": "/双喜",
                    "isStatic": "1",
                    "IQLid": "106",
                    "AQLid": "108",
                    "QHide": "1",
                    "EMCode": "121001"
                },
                {
                    "QSid": "76",
                    "QDes": "/赞",
                    "IQLid": "52",
                    "AQLid": "52",
                    "EMCode": "179"
                },
                {
                    "QSid": "124",
                    "QDes": "/OK",
                    "isStatic": "1",
                    "IQLid": "64",
                    "AQLid": "64",
                    "EMCode": "189"
                },
                {
                    "QSid": "118",
                    "QDes": "/抱拳",
                    "IQLid": "56",
                    "AQLid": "56",
                    "EMCode": "183"
                },
                {
                    "QSid": "78",
                    "QDes": "/握手",
                    "IQLid": "54",
                    "AQLid": "54",
                    "EMCode": "181"
                },
                {
                    "QSid": "119",
                    "QDes": "/勾引",
                    "IQLid": "63",
                    "AQLid": "63",
                    "EMCode": "184"
                },
                {
                    "QSid": "79",
                    "QDes": "/胜利",
                    "IQLid": "55",
                    "AQLid": "55",
                    "EMCode": "182"
                },
                {
                    "QSid": "120",
                    "QDes": "/拳头",
                    "IQLid": "71",
                    "AQLid": "73",
                    "EMCode": "185"
                },
                {
                    "QSid": "121",
                    "QDes": "/差劲",
                    "IQLid": "70",
                    "AQLid": "72",
                    "EMCode": "186"
                },
                {
                    "QSid": "77",
                    "QDes": "/踩",
                    "IQLid": "53",
                    "AQLid": "53",
                    "EMCode": "180"
                },
                {
                    "QSid": "122",
                    "QDes": "/爱你",
                    "IQLid": "65",
                    "AQLid": "65",
                    "EMCode": "187"
                },
                {
                    "QSid": "123",
                    "QDes": "/NO",
                    "IQLid": "92",
                    "AQLid": "94",
                    "EMCode": "188"
                },
                {
                    "QSid": "201",
                    "QDes": "/点赞",
                    "IQLid": "171",
                    "AQLid": "150",
                    "EMCode": "271"
                },
                {
                    "QSid": "203",
                    "QDes": "/托脸",
                    "IQLid": "173",
                    "AQLid": "152",
                    "EMCode": "273"
                },
                {
                    "QSid": "204",
                    "QDes": "/吃",
                    "IQLid": "174",
                    "AQLid": "153",
                    "EMCode": "274"
                },
                {
                    "QSid": "202",
                    "QDes": "/无聊",
                    "IQLid": "172",
                    "AQLid": "151",
                    "EMCode": "272"
                },
                {
                    "QSid": "200",
                    "QDes": "/拜托",
                    "IQLid": "170",
                    "AQLid": "149",
                    "EMCode": "270"
                },
                {
                    "QSid": "194",
                    "QDes": "/不开心",
                    "IQLid": "164",
                    "AQLid": "143",
                    "EMCode": "264"
                },
                {
                    "QSid": "193",
                    "QDes": "/大笑",
                    "IQLid": "163",
                    "AQLid": "185",
                    "EMCode": "263"
                },
                {
                    "QSid": "197",
                    "QDes": "/冷漠",
                    "IQLid": "167",
                    "AQLid": "146",
                    "QHide": "1",
                    "EMCode": "267"
                },
                {
                    "QSid": "211",
                    "QDes": "/我不看",
                    "IQLid": "181",
                    "AQLid": "160",
                    "EMCode": "281"
                },
                {
                    "QSid": "210",
                    "QDes": "/飙泪",
                    "IQLid": "180",
                    "AQLid": "159",
                    "EMCode": "280"
                },
                {
                    "QSid": "198",
                    "QDes": "/呃",
                    "IQLid": "168",
                    "AQLid": "147",
                    "EMCode": "268"
                },
                {
                    "QSid": "199",
                    "QDes": "/好棒",
                    "IQLid": "169",
                    "AQLid": "148",
                    "QHide": "1",
                    "EMCode": "269"
                },
                {
                    "QSid": "207",
                    "QDes": "/花痴",
                    "IQLid": "177",
                    "AQLid": "156",
                    "QHide": "1",
                    "EMCode": "277"
                },
                {
                    "QSid": "205",
                    "QDes": "/送花",
                    "IQLid": "175",
                    "AQLid": "154",
                    "QHide": "1",
                    "EMCode": "275"
                },
                {
                    "QSid": "206",
                    "QDes": "/害怕",
                    "IQLid": "176",
                    "AQLid": "155",
                    "EMCode": "276"
                },
                {
                    "QSid": "208",
                    "QDes": "/小样儿",
                    "IQLid": "178",
                    "AQLid": "157",
                    "QHide": "1",
                    "EMCode": "278"
                },
                {
                    "QSid": "308",
                    "QDes": "/求红包",
                    "IQLid": "308",
                    "isCMEmoji": "1",
                    "AQLid": "308",
                    "QHide": "1",
                    "EMCode": "20243"
                },
                {
                    "QSid": "309",
                    "QDes": "/谢红包",
                    "IQLid": "309",
                    "isCMEmoji": "1",
                    "AQLid": "309",
                    "QHide": "1",
                    "EMCode": "20244"
                },
                {
                    "QSid": "310",
                    "QDes": "/新年烟花",
                    "IQLid": "310",
                    "isCMEmoji": "1",
                    "AQLid": "310",
                    "QHide": "1",
                    "EMCode": "20245"
                },
                {
                    "QSid": "290",
                    "QDes": "/敲开心",
                    "IQLid": "290",
                    "isCMEmoji": "1",
                    "AQLid": "290",
                    "EMCode": "20240"
                },
                {
                    "QSid": "291",
                    "QDes": "/震惊",
                    "IQLid": "291",
                    "isCMEmoji": "1",
                    "AQLid": "291",
                    "QHide": "1",
                    "EMCode": "20241"
                },
                {
                    "QSid": "292",
                    "QDes": "/让我康康",
                    "IQLid": "292",
                    "isCMEmoji": "1",
                    "AQLid": "292",
                    "EMCode": "20242"
                },
                {
                    "QSid": "226",
                    "QDes": "/拍桌",
                    "IQLid": "196",
                    "isCMEmoji": "1",
                    "AQLid": "198",
                    "EMCode": "297"
                },
                {
                    "QSid": "215",
                    "QDes": "/糊脸",
                    "IQLid": "185",
                    "isCMEmoji": "1",
                    "AQLid": "187",
                    "EMCode": "285"
                },
                {
                    "QSid": "237",
                    "QDes": "/偷看",
                    "IQLid": "207",
                    "isCMEmoji": "1",
                    "AQLid": "209",
                    "EMCode": "307"
                },
                {
                    "QSid": "214",
                    "QDes": "/啵啵",
                    "IQLid": "184",
                    "isCMEmoji": "1",
                    "AQLid": "186",
                    "EMCode": "284"
                },
                {
                    "QSid": "235",
                    "QDes": "/颤抖",
                    "IQLid": "205",
                    "isCMEmoji": "1",
                    "AQLid": "207",
                    "EMCode": "305"
                },
                {
                    "QSid": "222",
                    "QDes": "/抱抱",
                    "IQLid": "192",
                    "isCMEmoji": "1",
                    "AQLid": "194",
                    "EMCode": "292"
                },
                {
                    "QSid": "217",
                    "QDes": "/扯一扯",
                    "IQLid": "187",
                    "isCMEmoji": "1",
                    "AQLid": "189",
                    "EMCode": "287"
                },
                {
                    "QSid": "221",
                    "QDes": "/顶呱呱",
                    "IQLid": "191",
                    "isCMEmoji": "1",
                    "AQLid": "193",
                    "EMCode": "291"
                },
                {
                    "QSid": "225",
                    "QDes": "/撩一撩",
                    "IQLid": "195",
                    "isCMEmoji": "1",
                    "AQLid": "197",
                    "EMCode": "296"
                },
                {
                    "QSid": "241",
                    "QDes": "/生日快乐",
                    "IQLid": "211",
                    "isCMEmoji": "1",
                    "AQLid": "213",
                    "EMCode": "311"
                },
                {
                    "QSid": "227",
                    "QDes": "/拍手",
                    "IQLid": "197",
                    "isCMEmoji": "1",
                    "AQLid": "199",
                    "EMCode": "294"
                },
                {
                    "QSid": "238",
                    "QDes": "/扇脸",
                    "IQLid": "208",
                    "isCMEmoji": "1",
                    "AQLid": "210",
                    "EMCode": "308"
                },
                {
                    "QSid": "240",
                    "QDes": "/喷脸",
                    "IQLid": "210",
                    "isCMEmoji": "1",
                    "AQLid": "212",
                    "EMCode": "310"
                },
                {
                    "QSid": "229",
                    "QDes": "/干杯",
                    "IQLid": "199",
                    "isCMEmoji": "1",
                    "AQLid": "201",
                    "EMCode": "299"
                },
                {
                    "QSid": "216",
                    "QDes": "/拍头",
                    "IQLid": "186",
                    "isCMEmoji": "1",
                    "AQLid": "188",
                    "EMCode": "286"
                },
                {
                    "QSid": "218",
                    "QDes": "/舔一舔",
                    "IQLid": "188",
                    "isCMEmoji": "1",
                    "AQLid": "190",
                    "EMCode": "288"
                },
                {
                    "QSid": "233",
                    "QDes": "/掐一掐",
                    "IQLid": "203",
                    "isCMEmoji": "1",
                    "AQLid": "205",
                    "EMCode": "303"
                },
                {
                    "QSid": "219",
                    "QDes": "/蹭一蹭",
                    "IQLid": "189",
                    "isCMEmoji": "1",
                    "AQLid": "191",
                    "EMCode": "289"
                },
                {
                    "QSid": "244",
                    "QDes": "/扔狗",
                    "IQLid": "214",
                    "isCMEmoji": "1",
                    "AQLid": "216",
                    "EMCode": "312"
                },
                {
                    "QSid": "232",
                    "QDes": "/佛系",
                    "IQLid": "202",
                    "isCMEmoji": "1",
                    "AQLid": "204",
                    "EMCode": "302"
                },
                {
                    "QSid": "243",
                    "QDes": "/甩头",
                    "IQLid": "213",
                    "isCMEmoji": "1",
                    "AQLid": "215",
                    "EMCode": "313"
                },
                {
                    "QSid": "223",
                    "QDes": "/暴击",
                    "IQLid": "193",
                    "isCMEmoji": "1",
                    "AQLid": "195",
                    "EMCode": "293"
                },
                {
                    "QSid": "279",
                    "QDes": "/打脸",
                    "IQLid": "279",
                    "isCMEmoji": "1",
                    "AQLid": "279",
                    "QHide": "1",
                    "EMCode": "20238"
                },
                {
                    "QSid": "280",
                    "QDes": "/击掌",
                    "IQLid": "280",
                    "isCMEmoji": "1",
                    "AQLid": "280",
                    "QHide": "1",
                    "EMCode": "20239"
                },
                {
                    "QSid": "231",
                    "QDes": "/哼",
                    "IQLid": "201",
                    "isCMEmoji": "1",
                    "AQLid": "203",
                    "EMCode": "301"
                },
                {
                    "QSid": "224",
                    "QDes": "/开枪",
                    "IQLid": "194",
                    "isCMEmoji": "1",
                    "AQLid": "196",
                    "EMCode": "295"
                },
                {
                    "QSid": "278",
                    "QDes": "/汗",
                    "IQLid": "278",
                    "isCMEmoji": "1",
                    "AQLid": "278",
                    "EMCode": "20237"
                },
                {
                    "QSid": "236",
                    "QDes": "/啃头",
                    "IQLid": "206",
                    "isCMEmoji": "1",
                    "AQLid": "208",
                    "QHide": "1",
                    "EMCode": "306"
                },
                {
                    "QSid": "228",
                    "QDes": "/恭喜",
                    "IQLid": "198",
                    "isCMEmoji": "1",
                    "AQLid": "200",
                    "QHide": "1",
                    "EMCode": "298"
                },
                {
                    "QSid": "220",
                    "QDes": "/拽炸天",
                    "IQLid": "190",
                    "isCMEmoji": "1",
                    "AQLid": "192",
                    "QHide": "1",
                    "EMCode": "290"
                },
                {
                    "QSid": "239",
                    "QDes": "/原谅",
                    "IQLid": "209",
                    "isCMEmoji": "1",
                    "AQLid": "211",
                    "EMCode": "309"
                },
                {
                    "QSid": "242",
                    "QDes": "/头撞击",
                    "IQLid": "212",
                    "isCMEmoji": "1",
                    "AQLid": "214",
                    "QHide": "1",
                    "EMCode": "314"
                },
                {
                    "QSid": "230",
                    "QDes": "/嘲讽",
                    "IQLid": "200",
                    "isCMEmoji": "1",
                    "AQLid": "202",
                    "EMCode": "300"
                },
                {
                    "QSid": "234",
                    "QDes": "/惊呆",
                    "IQLid": "204",
                    "isCMEmoji": "1",
                    "AQLid": "206",
                    "QHide": "1",
                    "EMCode": "304"
                },
                {
                    "QSid": "273",
                    "QDes": "/我酸了",
                    "isStatic": "1",
                    "IQLid": "273",
                    "AQLid": "273",
                    "EMCode": "10273"
                },
                {
                    "QSid": "75",
                    "QDes": "/月亮",
                    "isStatic": "1",
                    "IQLid": "67",
                    "AQLid": "68",
                    "EMCode": "175"
                },
                {
                    "QSid": "74",
                    "QDes": "/太阳",
                    "isStatic": "1",
                    "IQLid": "73",
                    "AQLid": "75",
                    "EMCode": "176"
                },
                {
                    "QSid": "46",
                    "QDes": "/猪头",
                    "isStatic": "1",
                    "IQLid": "7",
                    "AQLid": "7",
                    "EMCode": "162"
                },
                {
                    "QSid": "112",
                    "QDes": "/菜刀",
                    "IQLid": "17",
                    "AQLid": "17",
                    "EMCode": "155"
                },
                {
                    "QSid": "56",
                    "QDes": "/刀",
                    "IQLid": "68",
                    "AQLid": "70",
                    "EMCode": "171"
                },
                {
                    "QSid": "169",
                    "QDes": "/手枪",
                    "isStatic": "1",
                    "IQLid": "139",
                    "AQLid": "141",
                    "EMCode": "121034"
                },
                {
                    "QSid": "171",
                    "QDes": "/茶",
                    "IQLid": "141",
                    "AQLid": "163",
                    "EMCode": "241"
                },
                {
                    "QSid": "59",
                    "QDes": "/便便",
                    "IQLid": "15",
                    "AQLid": "15",
                    "EMCode": "174"
                },
                {
                    "QSid": "144",
                    "QDes": "/喝彩",
                    "isStatic": "1",
                    "IQLid": "114",
                    "AQLid": "116",
                    "EMCode": "121009"
                },
                {
                    "QSid": "147",
                    "QDes": "/棒棒糖",
                    "isStatic": "1",
                    "IQLid": "117",
                    "AQLid": "119",
                    "EMCode": "121012"
                },
                {
                    "QSid": "89",
                    "QDes": "/西瓜",
                    "isStatic": "1",
                    "IQLid": "60",
                    "AQLid": "60",
                    "EMCode": "156"
                },
                {
                    "QSid": "61",
                    "QDes": "/饭",
                    "isStatic": "1",
                    "IQLid": "58",
                    "AQLid": "58",
                    "QHide": "1",
                    "EMCode": "161"
                },
                {
                    "QSid": "148",
                    "QDes": "/喝奶",
                    "isStatic": "1",
                    "IQLid": "118",
                    "AQLid": "120",
                    "QHide": "1",
                    "EMCode": "121013"
                },
                {
                    "QSid": "274",
                    "QDes": "/太南了",
                    "isStatic": "1",
                    "IQLid": "274",
                    "AQLid": "274",
                    "QHide": "1",
                    "EMCode": "10274"
                },
                {
                    "QSid": "113",
                    "QDes": "/啤酒",
                    "IQLid": "61",
                    "AQLid": "61",
                    "QHide": "1",
                    "EMCode": "157"
                },
                {
                    "QSid": "140",
                    "QDes": "/K歌",
                    "isStatic": "1",
                    "IQLid": "110",
                    "AQLid": "112",
                    "QHide": "1",
                    "EMCode": "121005"
                },
                {
                    "QSid": "188",
                    "QDes": "/蛋",
                    "IQLid": "158",
                    "AQLid": "180",
                    "QHide": "1",
                    "EMCode": "258"
                },
                {
                    "QSid": "55",
                    "QDes": "/炸弹",
                    "isStatic": "1",
                    "IQLid": "16",
                    "AQLid": "16",
                    "QHide": "1",
                    "EMCode": "170"
                },
                {
                    "QSid": "184",
                    "QDes": "/河蟹",
                    "IQLid": "154",
                    "AQLid": "176",
                    "QHide": "1",
                    "EMCode": "254"
                },
                {
                    "QSid": "158",
                    "QDes": "/钞票",
                    "isStatic": "1",
                    "IQLid": "128",
                    "AQLid": "130",
                    "QHide": "1",
                    "EMCode": "121023"
                },
                {
                    "QSid": "54",
                    "QDes": "/闪电",
                    "isStatic": "1",
                    "IQLid": "78",
                    "AQLid": "80",
                    "QHide": "1",
                    "EMCode": "169"
                },
                {
                    "QSid": "69",
                    "QDes": "/礼物",
                    "isStatic": "1",
                    "IQLid": "74",
                    "AQLid": "76",
                    "QHide": "1",
                    "EMCode": "177"
                },
                {
                    "QSid": "190",
                    "QDes": "/菊花",
                    "IQLid": "160",
                    "AQLid": "182",
                    "QHide": "1",
                    "EMCode": "260"
                },
                {
                    "QSid": "151",
                    "QDes": "/飞机",
                    "isStatic": "1",
                    "IQLid": "121",
                    "AQLid": "123",
                    "QHide": "1",
                    "EMCode": "121016"
                },
                {
                    "QSid": "145",
                    "QDes": "/祈祷",
                    "isStatic": "1",
                    "IQLid": "115",
                    "AQLid": "117",
                    "QHide": "1",
                    "EMCode": "121010"
                },
                {
                    "QSid": "117",
                    "QDes": "/瓢虫",
                    "IQLid": "62",
                    "AQLid": "62",
                    "QHide": "1",
                    "EMCode": "173"
                },
                {
                    "QSid": "168",
                    "QDes": "/药",
                    "isStatic": "1",
                    "IQLid": "138",
                    "AQLid": "140",
                    "QHide": "1",
                    "EMCode": "121033"
                },
                {
                    "QSid": "115",
                    "QDes": "/乒乓",
                    "IQLid": "91",
                    "AQLid": "93",
                    "QHide": "1",
                    "EMCode": "159"
                },
                {
                    "QSid": "57",
                    "QDes": "/足球",
                    "IQLid": "75",
                    "AQLid": "77",
                    "QHide": "1",
                    "EMCode": "172"
                },
                {
                    "QSid": "41",
                    "QDes": "/发抖",
                    "isStatic": "1",
                    "IQLid": "69",
                    "AQLid": "71",
                    "EMCode": "193"
                },
                {
                    "QSid": "125",
                    "QDes": "/转圈",
                    "IQLid": "95",
                    "AQLid": "97",
                    "EMCode": "195"
                },
                {
                    "QSid": "42",
                    "QDes": "/爱情",
                    "IQLid": "38",
                    "AQLid": "38",
                    "EMCode": "190"
                },
                {
                    "QSid": "43",
                    "QDes": "/跳跳",
                    "IQLid": "93",
                    "AQLid": "95",
                    "EMCode": "192"
                },
                {
                    "QSid": "86",
                    "QDes": "/怄火",
                    "IQLid": "94",
                    "AQLid": "96",
                    "EMCode": "194"
                },
                {
                    "QSid": "129",
                    "QDes": "/挥手",
                    "IQLid": "77",
                    "AQLid": "79",
                    "EMCode": "199"
                },
                {
                    "QSid": "85",
                    "QDes": "/飞吻",
                    "isStatic": "1",
                    "IQLid": "47",
                    "AQLid": "47",
                    "EMCode": "191"
                },
                {
                    "QSid": "126",
                    "QDes": "/磕头",
                    "IQLid": "96",
                    "AQLid": "98",
                    "QHide": "1",
                    "EMCode": "196"
                },
                {
                    "QSid": "128",
                    "QDes": "/跳绳",
                    "IQLid": "98",
                    "AQLid": "100",
                    "QHide": "1",
                    "EMCode": "198"
                },
                {
                    "QSid": "130",
                    "QDes": "/激动",
                    "IQLid": "99",
                    "AQLid": "101",
                    "QHide": "1",
                    "EMCode": "200"
                },
                {
                    "QSid": "127",
                    "QDes": "/回头",
                    "IQLid": "97",
                    "AQLid": "99",
                    "QHide": "1",
                    "EMCode": "197"
                },
                {
                    "QSid": "132",
                    "QDes": "/献吻",
                    "IQLid": "101",
                    "AQLid": "103",
                    "QHide": "1",
                    "EMCode": "202"
                },
                {
                    "QSid": "134",
                    "QDes": "/右太极",
                    "IQLid": "103",
                    "AQLid": "105",
                    "QHide": "1",
                    "EMCode": "204"
                },
                {
                    "QSid": "133",
                    "QDes": "/左太极",
                    "IQLid": "102",
                    "AQLid": "104",
                    "QHide": "1",
                    "EMCode": "203"
                },
                {
                    "QSid": "131",
                    "QDes": "/街舞",
                    "IQLid": "100",
                    "AQLid": "102",
                    "QHide": "1",
                    "EMCode": "201"
                },
                {
                    "QSid": "276",
                    "QDes": "/辣椒酱",
                    "isStatic": "1",
                    "IQLid": "276",
                    "AQLid": "276",
                    "QHide": "1",
                    "EMCode": "10276"
                }
            ],
            "emoji": [{
                    "QSid": "😊",
                    "QCid": "128522",
                    "AQLid": "0",
                    "QDes": "/嘿嘿",
                    "EMCode": "400832"
                },
                {
                    "QSid": "😌",
                    "QCid": "128524",
                    "AQLid": "1",
                    "QDes": "/羞涩",
                    "EMCode": "400834"
                },
                {
                    "QSid": "😚",
                    "QCid": "128538",
                    "AQLid": "2",
                    "QDes": "/亲亲",
                    "EMCode": "400848"
                },
                {
                    "QSid": "😓",
                    "QCid": "128531",
                    "AQLid": "3",
                    "QDes": "/汗",
                    "EMCode": "400841"
                },
                {
                    "QSid": "😰",
                    "QCid": "128560",
                    "AQLid": "4",
                    "QDes": "/紧张",
                    "EMCode": "400870"
                },
                {
                    "QSid": "😝",
                    "QCid": "128541",
                    "AQLid": "5",
                    "QDes": "/吐舌",
                    "EMCode": "400851"
                },
                {
                    "QSid": "😁",
                    "QCid": "128513",
                    "AQLid": "6",
                    "QDes": "/呲牙",
                    "EMCode": "400823"
                },
                {
                    "QSid": "😜",
                    "QCid": "128540",
                    "AQLid": "7",
                    "QDes": "/淘气",
                    "EMCode": "400850"
                },
                {
                    "QSid": "☺",
                    "QCid": "9786",
                    "AQLid": "8",
                    "QDes": "/可爱",
                    "EMCode": "401181"
                },
                {
                    "QSid": "😉",
                    "QCid": "128521",
                    "AQLid": "9",
                    "QDes": "/媚眼",
                    "QHide": "1",
                    "EMCode": "400831"
                },
                {
                    "QSid": "😍",
                    "QCid": "128525",
                    "AQLid": "10",
                    "QDes": "/花痴",
                    "EMCode": "400835"
                },
                {
                    "QSid": "😔",
                    "QCid": "128532",
                    "AQLid": "11",
                    "QDes": "/失落",
                    "EMCode": "400842"
                },
                {
                    "QSid": "😄",
                    "QCid": "128516",
                    "AQLid": "12",
                    "QDes": "/高兴",
                    "EMCode": "400826"
                },
                {
                    "QSid": "😏",
                    "QCid": "128527",
                    "AQLid": "13",
                    "QDes": "/哼哼",
                    "EMCode": "400837"
                },
                {
                    "QSid": "😒",
                    "QCid": "128530",
                    "AQLid": "14",
                    "QDes": "/不屑",
                    "EMCode": "400840"
                },
                {
                    "QSid": "😳",
                    "QCid": "128563",
                    "AQLid": "15",
                    "QDes": "/瞪眼",
                    "EMCode": "400873"
                },
                {
                    "QSid": "😘",
                    "QCid": "128536",
                    "AQLid": "16",
                    "QDes": "/飞吻",
                    "EMCode": "400846"
                },
                {
                    "QSid": "😭",
                    "QCid": "128557",
                    "AQLid": "17",
                    "QDes": "/大哭",
                    "EMCode": "400867"
                },
                {
                    "QSid": "😱",
                    "QCid": "128561",
                    "AQLid": "18",
                    "QDes": "/害怕",
                    "EMCode": "400871"
                },
                {
                    "QSid": "😂",
                    "QCid": "128514",
                    "AQLid": "19",
                    "QDes": "/激动",
                    "EMCode": "400824"
                },
                {
                    "QSid": "💪",
                    "QCid": "128170",
                    "AQLid": "20",
                    "QDes": "/肌肉",
                    "EMCode": "400644"
                },
                {
                    "QSid": "👊",
                    "QCid": "128074",
                    "AQLid": "21",
                    "QDes": "/拳头",
                    "EMCode": "400390"
                },
                {
                    "QSid": "👍",
                    "QCid": "128077",
                    "AQLid": "22",
                    "QDes": "/厉害",
                    "EMCode": "400408"
                },
                {
                    "QSid": "☝",
                    "QCid": "9757",
                    "AQLid": "23",
                    "QDes": "/向上",
                    "QHide": "1",
                    "EMCode": "401203"
                },
                {
                    "QSid": "👏",
                    "QCid": "128079",
                    "AQLid": "24",
                    "QDes": "/鼓掌",
                    "EMCode": "400420"
                },
                {
                    "QSid": "✌",
                    "QCid": "9996",
                    "AQLid": "25",
                    "QDes": "/胜利",
                    "QHide": "1",
                    "EMCode": "401210"
                },
                {
                    "QSid": "👎",
                    "QCid": "128078",
                    "AQLid": "26",
                    "QDes": "/鄙视",
                    "EMCode": "400414"
                },
                {
                    "QSid": "🙏",
                    "QCid": "128591",
                    "AQLid": "27",
                    "QDes": "/合十",
                    "EMCode": "400396"
                },
                {
                    "QSid": "👌",
                    "QCid": "128076",
                    "AQLid": "28",
                    "QDes": "/好的",
                    "EMCode": "400402"
                },
                {
                    "QSid": "👈",
                    "QCid": "128072",
                    "AQLid": "29",
                    "QDes": "/向左",
                    "QHide": "1",
                    "EMCode": "400378"
                },
                {
                    "QSid": "👉",
                    "QCid": "128073",
                    "AQLid": "30",
                    "QDes": "/向右",
                    "QHide": "1",
                    "EMCode": "400384"
                },
                {
                    "QSid": "👆",
                    "QCid": "128070",
                    "AQLid": "31",
                    "QDes": "/向上",
                    "EMCode": "400366"
                },
                {
                    "QSid": "👇",
                    "QCid": "128071",
                    "AQLid": "32",
                    "QDes": "/向下",
                    "QHide": "1",
                    "EMCode": "400372"
                },
                {
                    "QSid": "👀",
                    "QCid": "128064",
                    "AQLid": "33",
                    "QDes": "/眼睛",
                    "EMCode": "400351"
                },
                {
                    "QSid": "👃",
                    "QCid": "128067",
                    "AQLid": "34",
                    "QDes": "/鼻子",
                    "QHide": "1",
                    "EMCode": "400358"
                },
                {
                    "QSid": "👄",
                    "QCid": "128068",
                    "AQLid": "35",
                    "QDes": "/嘴唇",
                    "QHide": "1",
                    "EMCode": "400364"
                },
                {
                    "QSid": "👂",
                    "QCid": "128066",
                    "AQLid": "36",
                    "QDes": "/耳朵",
                    "QHide": "1",
                    "EMCode": "400352"
                },
                {
                    "QSid": "🍚",
                    "QCid": "127834",
                    "AQLid": "37",
                    "QDes": "/米饭",
                    "QHide": "1",
                    "EMCode": "400149"
                },
                {
                    "QSid": "🍝",
                    "QCid": "127837",
                    "AQLid": "38",
                    "QDes": "/意面",
                    "QHide": "1",
                    "EMCode": "400152"
                },
                {
                    "QSid": "🍜",
                    "QCid": "127836",
                    "AQLid": "39",
                    "QDes": "/拉面",
                    "EMCode": "400151"
                },
                {
                    "QSid": "🍙",
                    "QCid": "127833",
                    "AQLid": "40",
                    "QDes": "/饭团",
                    "QHide": "1",
                    "EMCode": "400148"
                },
                {
                    "QSid": "🍧",
                    "QCid": "127847",
                    "AQLid": "41",
                    "QDes": "/刨冰",
                    "EMCode": "400162"
                },
                {
                    "QSid": "🍣",
                    "QCid": "127843",
                    "AQLid": "42",
                    "QDes": "/寿司",
                    "QHide": "1",
                    "EMCode": "400158"
                },
                {
                    "QSid": "🎂",
                    "QCid": "127874",
                    "AQLid": "43",
                    "QDes": "/蛋糕",
                    "QHide": "1",
                    "EMCode": "400186"
                },
                {
                    "QSid": "🍞",
                    "QCid": "127838",
                    "AQLid": "44",
                    "QDes": "/面包",
                    "EMCode": "400153"
                },
                {
                    "QSid": "🍔",
                    "QCid": "127828",
                    "AQLid": "45",
                    "QDes": "/汉堡",
                    "QHide": "1",
                    "EMCode": "400143"
                },
                {
                    "QSid": "🍳",
                    "QCid": "127859",
                    "AQLid": "46",
                    "QDes": "/煎蛋",
                    "QHide": "1",
                    "EMCode": "400174"
                },
                {
                    "QSid": "🍟",
                    "QCid": "127839",
                    "AQLid": "47",
                    "QDes": "/薯条",
                    "QHide": "1",
                    "EMCode": "400154"
                },
                {
                    "QSid": "🍺",
                    "QCid": "127866",
                    "AQLid": "48",
                    "QDes": "/啤酒",
                    "EMCode": "400181"
                },
                {
                    "QSid": "🍻",
                    "QCid": "127867",
                    "AQLid": "49",
                    "QDes": "/干杯",
                    "EMCode": "400182"
                },
                {
                    "QSid": "🍸",
                    "QCid": "127864",
                    "AQLid": "50",
                    "QDes": "/高脚杯",
                    "QHide": "1",
                    "EMCode": "400179"
                },
                {
                    "QSid": "☕",
                    "QCid": "9749",
                    "AQLid": "51",
                    "QDes": "/咖啡",
                    "EMCode": "401262"
                },
                {
                    "QSid": "🍎",
                    "QCid": "127822",
                    "AQLid": "52",
                    "QDes": "/苹果",
                    "EMCode": "400137"
                },
                {
                    "QSid": "🍊",
                    "QCid": "127818",
                    "AQLid": "53",
                    "QDes": "/橙子",
                    "QHide": "1",
                    "EMCode": "400133"
                },
                {
                    "QSid": "🍓",
                    "QCid": "127827",
                    "AQLid": "54",
                    "QDes": "/草莓",
                    "EMCode": "400142"
                },
                {
                    "QSid": "🍉",
                    "QCid": "127817",
                    "AQLid": "55",
                    "QDes": "/西瓜",
                    "EMCode": "400132"
                },
                {
                    "QSid": "💊",
                    "QCid": "128138",
                    "AQLid": "56",
                    "QDes": "/药丸",
                    "QHide": "1",
                    "EMCode": "400612"
                },
                {
                    "QSid": "🚬",
                    "QCid": "128684",
                    "AQLid": "57",
                    "QDes": "/吸烟",
                    "EMCode": "400987"
                },
                {
                    "QSid": "🎄",
                    "QCid": "127876",
                    "AQLid": "58",
                    "QDes": "/圣诞树",
                    "QHide": "1",
                    "EMCode": "400188"
                },
                {
                    "QSid": "🌹",
                    "QCid": "127801",
                    "AQLid": "59",
                    "QDes": "/玫瑰",
                    "EMCode": "400116"
                },
                {
                    "QSid": "🎉",
                    "QCid": "127881",
                    "AQLid": "60",
                    "QDes": "/庆祝",
                    "EMCode": "400198"
                },
                {
                    "QSid": "🌴",
                    "QCid": "127796",
                    "AQLid": "61",
                    "QDes": "/椰子树",
                    "QHide": "1",
                    "EMCode": "400112"
                },
                {
                    "QSid": "💝",
                    "QCid": "128157",
                    "AQLid": "62",
                    "QDes": "/礼物",
                    "EMCode": "400631"
                },
                {
                    "QSid": "🎀",
                    "QCid": "127872",
                    "AQLid": "63",
                    "QDes": "/蝴蝶结",
                    "QHide": "1",
                    "EMCode": "400184"
                },
                {
                    "QSid": "🎈",
                    "QCid": "127880",
                    "AQLid": "64",
                    "QDes": "/气球",
                    "QHide": "1",
                    "EMCode": "400197"
                },
                {
                    "QSid": "🐚",
                    "QCid": "128026",
                    "AQLid": "65",
                    "QDes": "/海螺",
                    "QHide": "1",
                    "EMCode": "400314"
                },
                {
                    "QSid": "💍",
                    "QCid": "128141",
                    "AQLid": "66",
                    "QDes": "/戒指",
                    "QHide": "1",
                    "EMCode": "400615"
                },
                {
                    "QSid": "💣",
                    "QCid": "128163",
                    "AQLid": "67",
                    "QDes": "/炸弹",
                    "EMCode": "400637"
                },
                {
                    "QSid": "👑",
                    "QCid": "128081",
                    "AQLid": "68",
                    "QDes": "/皇冠",
                    "QHide": "1",
                    "EMCode": "400432"
                },
                {
                    "QSid": "🔔",
                    "QCid": "128276",
                    "AQLid": "69",
                    "QDes": "/铃铛",
                    "QHide": "1",
                    "EMCode": "400751"
                },
                {
                    "QSid": "⭐",
                    "QCid": "11088",
                    "AQLid": "70",
                    "QDes": "/星星",
                    "QHide": "1",
                    "EMCode": "401686"
                },
                {
                    "QSid": "✨",
                    "QCid": "10024",
                    "AQLid": "71",
                    "QDes": "/闪光",
                    "EMCode": "401137"
                },
                {
                    "QSid": "💨",
                    "QCid": "128168",
                    "AQLid": "72",
                    "QDes": "/吹气",
                    "EMCode": "400642"
                },
                {
                    "QSid": "💦",
                    "QCid": "128166",
                    "AQLid": "73",
                    "QDes": "/水",
                    "EMCode": "400640"
                },
                {
                    "QSid": "🔥",
                    "QCid": "128293",
                    "AQLid": "74",
                    "QDes": "/火",
                    "EMCode": "400768"
                },
                {
                    "QSid": "🏆",
                    "QCid": "127942",
                    "AQLid": "75",
                    "QDes": "/奖杯",
                    "QHide": "1",
                    "EMCode": "400256"
                },
                {
                    "QSid": "💰",
                    "QCid": "128176",
                    "AQLid": "76",
                    "QDes": "/钱",
                    "QHide": "1",
                    "EMCode": "400655"
                },
                {
                    "QSid": "💤",
                    "QCid": "128164",
                    "AQLid": "77",
                    "QDes": "/睡觉",
                    "EMCode": "400638"
                },
                {
                    "QSid": "⚡",
                    "QCid": "9889",
                    "AQLid": "78",
                    "QDes": "/闪电",
                    "QHide": "1",
                    "EMCode": "401685"
                },
                {
                    "QSid": "👣",
                    "QCid": "128099",
                    "AQLid": "79",
                    "QDes": "/脚印",
                    "QHide": "1",
                    "EMCode": "400450"
                },
                {
                    "QSid": "💩",
                    "QCid": "128169",
                    "AQLid": "80",
                    "QDes": "/便便",
                    "EMCode": "400643"
                },
                {
                    "QSid": "💉",
                    "QCid": "128137",
                    "AQLid": "81",
                    "QDes": "/打针",
                    "EMCode": "400611"
                },
                {
                    "QSid": "♨",
                    "QCid": "9832",
                    "AQLid": "82",
                    "QDes": "/热",
                    "QHide": "1",
                    "EMCode": "401287"
                },
                {
                    "QSid": "📫",
                    "QCid": "128235",
                    "AQLid": "83",
                    "QDes": "/邮箱",
                    "EMCode": "400714"
                },
                {
                    "QSid": "🔑",
                    "QCid": "128273",
                    "AQLid": "84",
                    "QDes": "/钥匙",
                    "QHide": "1",
                    "EMCode": "400748"
                },
                {
                    "QSid": "🔒",
                    "QCid": "128274",
                    "AQLid": "85",
                    "QDes": "/锁",
                    "QHide": "1",
                    "EMCode": "400749"
                },
                {
                    "QSid": "✈",
                    "QCid": "9992",
                    "AQLid": "86",
                    "QDes": "/飞机",
                    "QHide": "1",
                    "EMCode": "401298"
                },
                {
                    "QSid": "🚄",
                    "QCid": "128644",
                    "AQLid": "87",
                    "QDes": "/列车",
                    "QHide": "1",
                    "EMCode": "400942"
                },
                {
                    "QSid": "🚗",
                    "QCid": "128663",
                    "AQLid": "88",
                    "QDes": "/汽车",
                    "QHide": "1",
                    "EMCode": "400961"
                },
                {
                    "QSid": "🚤",
                    "QCid": "128676",
                    "AQLid": "89",
                    "QDes": "/快艇",
                    "QHide": "1",
                    "EMCode": "400979"
                },
                {
                    "QSid": "🚲",
                    "QCid": "128690",
                    "AQLid": "90",
                    "QDes": "/自行车",
                    "QHide": "1",
                    "EMCode": "400993"
                },
                {
                    "QSid": "🐎",
                    "QCid": "128014",
                    "AQLid": "91",
                    "QDes": "/骑马",
                    "EMCode": "400302"
                },
                {
                    "QSid": "🚀",
                    "QCid": "128640",
                    "AQLid": "92",
                    "QDes": "/火箭",
                    "QHide": "1",
                    "EMCode": "400938"
                },
                {
                    "QSid": "🚌",
                    "QCid": "128652",
                    "AQLid": "93",
                    "QDes": "/公交",
                    "QHide": "1",
                    "EMCode": "400950"
                },
                {
                    "QSid": "⛵",
                    "QCid": "9973",
                    "AQLid": "94",
                    "QDes": "/船",
                    "QHide": "1",
                    "EMCode": "401294"
                },
                {
                    "QSid": "👩",
                    "QCid": "128105",
                    "AQLid": "95",
                    "QDes": "/妈妈",
                    "QHide": "1",
                    "EMCode": "400482"
                },
                {
                    "QSid": "👨",
                    "QCid": "128104",
                    "AQLid": "96",
                    "QDes": "/爸爸",
                    "EMCode": "400465"
                },
                {
                    "QSid": "👧",
                    "QCid": "128103",
                    "AQLid": "97",
                    "QDes": "/女孩",
                    "QHide": "1",
                    "EMCode": "400459"
                },
                {
                    "QSid": "👦",
                    "QCid": "128102",
                    "AQLid": "98",
                    "QDes": "/男孩",
                    "EMCode": "400453"
                },
                {
                    "QSid": "🐵",
                    "QCid": "128053",
                    "AQLid": "99",
                    "QDes": "/猴",
                    "EMCode": "400341"
                },
                {
                    "QSid": "🐙",
                    "QCid": "128025",
                    "AQLid": "100",
                    "QDes": "/章鱼",
                    "QHide": "1",
                    "EMCode": "400313"
                },
                {
                    "QSid": "🐷",
                    "QCid": "128055",
                    "AQLid": "101",
                    "QDes": "/猪",
                    "EMCode": "400343"
                },
                {
                    "QSid": "💀",
                    "QCid": "128128",
                    "AQLid": "102",
                    "QDes": "/骷髅",
                    "QHide": "1",
                    "EMCode": "400572"
                },
                {
                    "QSid": "🐤",
                    "QCid": "128036",
                    "AQLid": "103",
                    "QDes": "/小鸡",
                    "QHide": "1",
                    "EMCode": "400324"
                },
                {
                    "QSid": "🐨",
                    "QCid": "128040",
                    "AQLid": "104",
                    "QDes": "/树懒",
                    "QHide": "1",
                    "EMCode": "400328"
                },
                {
                    "QSid": "🐮",
                    "QCid": "128046",
                    "AQLid": "105",
                    "QDes": "/牛",
                    "EMCode": "400334"
                },
                {
                    "QSid": "🐔",
                    "QCid": "128020",
                    "AQLid": "106",
                    "QDes": "/公鸡",
                    "EMCode": "400308"
                },
                {
                    "QSid": "🐸",
                    "QCid": "128056",
                    "AQLid": "107",
                    "QDes": "/青蛙",
                    "EMCode": "400344"
                },
                {
                    "QSid": "👻",
                    "QCid": "128123",
                    "AQLid": "108",
                    "QDes": "/幽灵",
                    "EMCode": "400562"
                },
                {
                    "QSid": "🐛",
                    "QCid": "128027",
                    "AQLid": "109",
                    "QDes": "/虫",
                    "EMCode": "400315"
                },
                {
                    "QSid": "🐠",
                    "QCid": "128032",
                    "AQLid": "110",
                    "QDes": "/鱼",
                    "QHide": "1",
                    "EMCode": "400320"
                },
                {
                    "QSid": "🐶",
                    "QCid": "128054",
                    "AQLid": "111",
                    "QDes": "/狗",
                    "EMCode": "400342"
                },
                {
                    "QSid": "🐯",
                    "QCid": "128047",
                    "AQLid": "112",
                    "QDes": "/老虎",
                    "QHide": "1",
                    "EMCode": "400335"
                },
                {
                    "QSid": "👼",
                    "QCid": "128124",
                    "AQLid": "113",
                    "QDes": "/天使",
                    "QHide": "1",
                    "EMCode": "400563"
                },
                {
                    "QSid": "🐧",
                    "QCid": "128039",
                    "AQLid": "114",
                    "QDes": "/企鹅",
                    "QHide": "1",
                    "EMCode": "400327"
                },
                {
                    "QSid": "🐳",
                    "QCid": "128051",
                    "AQLid": "115",
                    "QDes": "/鲸鱼",
                    "EMCode": "400339"
                },
                {
                    "QSid": "🐭",
                    "QCid": "128045",
                    "AQLid": "116",
                    "QDes": "/老鼠",
                    "QHide": "1",
                    "EMCode": "400333"
                },
                {
                    "QSid": "👒",
                    "QCid": "128082",
                    "AQLid": "117",
                    "QDes": "/帽子",
                    "QHide": "1",
                    "EMCode": "400433"
                },
                {
                    "QSid": "👗",
                    "QCid": "128087",
                    "AQLid": "118",
                    "QDes": "/连衣裙",
                    "QHide": "1",
                    "EMCode": "400438"
                },
                {
                    "QSid": "💄",
                    "QCid": "128132",
                    "AQLid": "119",
                    "QDes": "/口红",
                    "QHide": "1",
                    "EMCode": "400591"
                },
                {
                    "QSid": "👠",
                    "QCid": "128096",
                    "AQLid": "120",
                    "QDes": "/高跟鞋",
                    "QHide": "1",
                    "EMCode": "400447"
                },
                {
                    "QSid": "👢",
                    "QCid": "128098",
                    "AQLid": "121",
                    "QDes": "/靴子",
                    "EMCode": "400449"
                },
                {
                    "QSid": "🌂",
                    "QCid": "127746",
                    "AQLid": "122",
                    "QDes": "/雨伞",
                    "QHide": "1",
                    "EMCode": "400077"
                },
                {
                    "QSid": "👜",
                    "QCid": "128092",
                    "AQLid": "123",
                    "QDes": "/包",
                    "QHide": "1",
                    "EMCode": "400443"
                },
                {
                    "QSid": "👙",
                    "QCid": "128089",
                    "AQLid": "124",
                    "QDes": "/内衣",
                    "QHide": "1",
                    "EMCode": "400440"
                },
                {
                    "QSid": "👕",
                    "QCid": "128085",
                    "AQLid": "125",
                    "QDes": "/衣服",
                    "QHide": "1",
                    "EMCode": "400436"
                },
                {
                    "QSid": "👟",
                    "QCid": "128095",
                    "AQLid": "126",
                    "QDes": "/鞋子",
                    "QHide": "1",
                    "EMCode": "400446"
                },
                {
                    "QSid": "☁",
                    "QCid": "9729",
                    "AQLid": "127",
                    "QDes": "/云朵",
                    "QHide": "1",
                    "EMCode": "401329"
                },
                {
                    "QSid": "☀",
                    "QCid": "9728",
                    "AQLid": "128",
                    "QDes": "/晴天",
                    "EMCode": "401328"
                },
                {
                    "QSid": "☔",
                    "QCid": "9748",
                    "AQLid": "129",
                    "QDes": "/雨天",
                    "QHide": "1",
                    "EMCode": "401342"
                },
                {
                    "QSid": "🌙",
                    "QCid": "127769",
                    "AQLid": "130",
                    "QDes": "/月亮",
                    "QHide": "1",
                    "EMCode": "400100"
                },
                {
                    "QSid": "⛄",
                    "QCid": "9924",
                    "AQLid": "131",
                    "QDes": "/雪人",
                    "QHide": "1",
                    "EMCode": "401346"
                },
                {
                    "QSid": "⭕",
                    "QCid": "11093",
                    "AQLid": "132",
                    "QDes": "/正确",
                    "QHide": "1",
                    "EMCode": "401687"
                },
                {
                    "QSid": "❌",
                    "QCid": "10060",
                    "AQLid": "133",
                    "QDes": "/错误",
                    "QHide": "1",
                    "EMCode": "401142"
                },
                {
                    "QSid": "❔",
                    "QCid": "10068",
                    "AQLid": "134",
                    "QDes": "/问号",
                    "EMCode": "401145"
                },
                {
                    "QSid": "❕",
                    "QCid": "10069",
                    "AQLid": "135",
                    "QDes": "/叹号",
                    "QHide": "1",
                    "EMCode": "401146"
                },
                {
                    "QSid": "☎",
                    "QCid": "9742",
                    "AQLid": "136",
                    "QDes": "/电话",
                    "QHide": "1",
                    "EMCode": "401398"
                },
                {
                    "QSid": "📷",
                    "QCid": "128247",
                    "AQLid": "137",
                    "QDes": "/相机",
                    "QHide": "1",
                    "EMCode": "400726"
                },
                {
                    "QSid": "📱",
                    "QCid": "128241",
                    "AQLid": "138",
                    "QDes": "/手机",
                    "QHide": "1",
                    "EMCode": "400720"
                },
                {
                    "QSid": "📠",
                    "QCid": "128224",
                    "AQLid": "139",
                    "QDes": "/传真",
                    "QHide": "1",
                    "EMCode": "400703"
                },
                {
                    "QSid": "💻",
                    "QCid": "128187",
                    "AQLid": "140",
                    "QDes": "/电脑",
                    "QHide": "1",
                    "EMCode": "400666"
                },
                {
                    "QSid": "🎥",
                    "QCid": "127909",
                    "AQLid": "141",
                    "QDes": "/摄影机",
                    "QHide": "1",
                    "EMCode": "400214"
                },
                {
                    "QSid": "🎤",
                    "QCid": "127908",
                    "AQLid": "142",
                    "QDes": "/话筒",
                    "QHide": "1",
                    "EMCode": "400213"
                },
                {
                    "QSid": "🔫",
                    "QCid": "128299",
                    "AQLid": "143",
                    "QDes": "/手枪",
                    "EMCode": "400774"
                },
                {
                    "QSid": "💿",
                    "QCid": "128191",
                    "AQLid": "144",
                    "QDes": "/光碟",
                    "QHide": "1",
                    "EMCode": "400670"
                },
                {
                    "QSid": "💓",
                    "QCid": "128147",
                    "AQLid": "145",
                    "QDes": "/爱心",
                    "EMCode": "400621"
                },
                {
                    "QSid": "♣",
                    "QCid": "9827",
                    "AQLid": "146",
                    "QDes": "/扑克",
                    "QHide": "1",
                    "EMCode": "401385"
                },
                {
                    "QSid": "🀄",
                    "QCid": "126980",
                    "AQLid": "147",
                    "QDes": "/麻将",
                    "QHide": "1",
                    "EMCode": "401386"
                },
                {
                    "QSid": "〽",
                    "QCid": "12349",
                    "AQLid": "148",
                    "QDes": "/股票",
                    "QHide": "1",
                    "EMCode": "401691"
                },
                {
                    "QSid": "🎰",
                    "QCid": "127920",
                    "AQLid": "149",
                    "QDes": "/老虎机",
                    "QHide": "1",
                    "EMCode": "400225"
                },
                {
                    "QSid": "🚥",
                    "QCid": "128677",
                    "AQLid": "150",
                    "QDes": "/信号灯",
                    "QHide": "1",
                    "EMCode": "400980"
                },
                {
                    "QSid": "🚧",
                    "QCid": "128679",
                    "AQLid": "151",
                    "QDes": "/路障",
                    "QHide": "1",
                    "EMCode": "400982"
                },
                {
                    "QSid": "🎸",
                    "QCid": "127928",
                    "AQLid": "152",
                    "QDes": "/吉他",
                    "QHide": "1",
                    "EMCode": "400233"
                },
                {
                    "QSid": "💈",
                    "QCid": "128136",
                    "AQLid": "153",
                    "QDes": "/理发厅",
                    "QHide": "1",
                    "EMCode": "400610"
                },
                {
                    "QSid": "🛀",
                    "QCid": "128704",
                    "AQLid": "154",
                    "QDes": "/浴缸",
                    "QHide": "1",
                    "EMCode": "401022"
                },
                {
                    "QSid": "🚽",
                    "QCid": "128701",
                    "AQLid": "155",
                    "QDes": "/马桶",
                    "QHide": "1",
                    "EMCode": "401019"
                },
                {
                    "QSid": "🏠",
                    "QCid": "127968",
                    "AQLid": "156",
                    "QDes": "/家",
                    "QHide": "1",
                    "EMCode": "400271"
                },
                {
                    "QSid": "⛪",
                    "QCid": "9962",
                    "AQLid": "157",
                    "QDes": "/教堂",
                    "QHide": "1",
                    "EMCode": "401281"
                },
                {
                    "QSid": "🏦",
                    "QCid": "127974",
                    "AQLid": "158",
                    "QDes": "/银行",
                    "QHide": "1",
                    "EMCode": "400277"
                },
                {
                    "QSid": "🏥",
                    "QCid": "127973",
                    "AQLid": "159",
                    "QDes": "/医院",
                    "QHide": "1",
                    "EMCode": "400276"
                },
                {
                    "QSid": "🏨",
                    "QCid": "127976",
                    "AQLid": "160",
                    "QDes": "/酒店",
                    "QHide": "1",
                    "EMCode": "400279"
                },
                {
                    "QSid": "🏧",
                    "QCid": "127975",
                    "AQLid": "161",
                    "QDes": "/取款机",
                    "QHide": "1",
                    "EMCode": "400278"
                },
                {
                    "QSid": "🏪",
                    "QCid": "127978",
                    "AQLid": "162",
                    "QDes": "/便利店",
                    "EMCode": "400281"
                },
                {
                    "QSid": "🚹",
                    "QCid": "128697",
                    "AQLid": "163",
                    "QDes": "/男性",
                    "QHide": "1",
                    "EMCode": "401015"
                },
                {
                    "QSid": "🚺",
                    "QCid": "128698",
                    "AQLid": "164",
                    "QDes": "/女性",
                    "QHide": "1",
                    "EMCode": "401016"
                }
            ]
        };

        var EMOJI_TYPE = {
            EMOJI: '0',
            SYS_FACE: '1',
            OTHER: '2',
        };

        var polyfillFind = function(array) {
            array.find = function(callback) {
                for (var i = 0; i < array.length; i++) {
                    var find = callback(array[i]);
                    if (find) {
                        return array[i];
                    }
                }
            };
        };

        polyfillFind(emojiConfig.sysface);
        polyfillFind(emojiConfig.emoji);

        var emojiUrl = function(type, id = 0, url = '') {
            if (type === EMOJI_TYPE.OTHER) {
                return url;
            }
            return emojiId2Url({
                id,
                type,
            });
        };

        var emojiId2Url = function({
            id,
            type
        }) {
            var idStr = id;
            if (type === EMOJI_TYPE.SYS_FACE) {
                emojiConfig.sysface.find(function(face) {
                    return face.QSid === idStr;
                });
                // if (systemFaces) {
                //     return id2SysfaceUrl(systemFaces.QSid);
                // }
                return lastUrl(id)
            }
            if (type === EMOJI_TYPE.EMOJI) {
                var emojiFace = emojiConfig.emoji.find(function(face) {
                    return face.QCid === idStr;
                });

                if (emojiFace) {
                    return id2EmojiUrl(emojiFace.AQLid);
                }
            }
            ArkWindow.console.warn('error emoji', id, type);
            return '';
        };

        var id2EmojiUrl = function(id) {
            var name = ('00' + id).slice(-3);
            return 'https://framework.cdn-go.cn/qqmoji/latest/emoji/emoji_' + name + '.png';
        };

        var lastUrl = function(id) {
            return 'https://framework.cdn-go.cn/qqmoji/latest/sysface/static/s' + id + '.png';
        };

        global.getEmojiUrl = function(type, id) {
            var typeStr = (type % 2) + '';
            var idStr = id + '';
            return emojiUrl(typeStr, idStr);
        };
        global.getEmojiUnicode = function(type, id) {
            var newType = type % 2;
            if (newType == EMOJI_TYPE.EMOJI) {
                var emojiFace = emojiConfig.emoji.find(function(face) {
                    return face.QCid === (id + '');
                });

                if (emojiFace) {
                    return emojiFace.QSid;
                }
            }
            ArkWindow.console.warn('error getEmojiUnicode', id, type);
            return '';
        };
    })(global$u);

    var global$t = ArkWindow;
    (function(global) {

        var parseMatchStr = function(str) {
            var nick = (str.match(/nick:.+/) || [''])[0].slice(5, -1);
            return {
                isLinkMember: true,
                text: nick,
            }
        };
        var parseTextItem = function(str) {
            //提取括号里的内容物
            var regExp = /@{uin:([0-9]+|at_all),nick:.+?}/g;
            var result = [];
            while (str.length) {
                var match = regExp.exec(str);
                if (!match) {
                    //没有匹配 over
                    result.push({
                        isText: true,
                        text: str
                    });
                    break;
                } else {
                    //匹配成功 获取index
                    var matchStr = match[0];
                    var matchStart = match["index"];
                    // 切割匹配的前面子串 保存
                    var temStr = str.slice(0, matchStart);
                    if (temStr.length) {
                        result.push({
                            isText: true,
                            text: temStr
                        });
                    }
                    //str变为下次切割的字符串递归
                    str = str.slice(regExp.lastIndex);
                    //开始匹配汉字
                    var find = parseMatchStr(matchStr);
                    if (find.isLinkMember) {
                        //找到 扔进数组 over
                        result.push(find);
                    } else {
                        //招聘不到 普通字符串 over
                        result.push({
                            isText: true,
                            text: matchStr
                        });
                    }
                    //由于str赋值 lastIndex 要归0
                    regExp = /@{uin:([0-9]+|at_all),nick:.+?}/g;
                }
            }
            return result;
        };

        var parseText = function(data) {
            if (!data || !data.length) {
                return [];
            }
            var newData = [];
            data.forEach(function(item) {
                var isText = item.isText;
                var content = item.text;
                if (isText) {
                    var parseTextArray = parseTextItem(content);
                    newData = newData.concat(parseTextArray);
                } else {
                    newData.push(item);
                }
            });
            return newData;
        };
        var parseEm = function(content) {
            // 获取纯文本
            var reg = /(\[em\]e[0-9]+\[\/em\])/g;
            var reg2 = /\[em\]e[0-9]+\[\/em\]/g;
            // 表情开头
            var data = [];
            var el = content.split(reg);
            for (var i = 0; i < el.length; i++) {
                reg = /(\[em\]e[0-9]+\[\/em\])/g;
                reg2 = /\[em\]e([0-9]+)\[\/em\]/g;
                if (reg.test(el[i])) {
                    // image标签
                    var tem = {};
                    el[i].replace(reg2, (match, em) => {
                        var url = global.getEmojiUrl('1', Number(em));
                        tem = {
                            url: url,
                            id: em
                        };
                    });
                    if (tem.url) {
                        data.push({
                            isImage: true,
                            url: tem.url,
                            id: tem.id,
                        });
                    }
                    tem = {};
                    continue;
                }
                if (el[i] === '') {
                    continue;
                }
                data.push({
                    isText: true,
                    text: el[i]
                });
            }
            var newData = parseText(data);
            return newData;
        };
        global.parseEm = parseEm;
    })(global$t);

    var global$s = ArkWindow;
    (function() {
        var appView = "c2c";
        global$s[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + " new");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.log(appView + " messageView");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");
                    ArkWindow.console.log('this.metaData', this.metaData);
                    if (this.view.hasUpdate) {
                        return;
                    }
                    if (!this.metaData.c2c) {
                        return;
                    }
                    this.refs = {};
                    this.views = [];
                    this.fontSize = 'size.14';
                    this.colorConfig = ArkWindow.app.config;
                    this.view.hasUpdate = true;
                },

                renderView() {
                    if (this.hasUpdateRender) {
                        return;
                    }
                    var view = this.view.GetUIObject('c2cDescTextWrap');
                    this.refs.qunFeedText = view;
                    view.ClearChildren();
                    var renderWidth = view.GetSize().width;
                    if (!renderWidth) {
                        ArkWindow.console.time('renderWidth :' + renderWidth);
                        return;
                    }
                    this.hasUpdateRender = true;
                    var data = this.metaData.c2c;
                    var dataArr = data.dataArr.slice(0);
                    var maxLen = 3;
                    ArkWindow.console.time('c2c UpdateRender renderWidth: ' + renderWidth);
                    this.renderEmojiView(renderWidth, view, dataArr, maxLen);
                    this.setTitle();
                    this.setAvatar();
                    this.setColorModel();
                },
                setColorModel() {
                    var config = this.colorConfig;
                    var titleView = this.view.GetUIObject('c2cMainTitle');
                    var tagTitle = this.view.GetUIObject('c2cTagTitle');
                    var tag = this.view.GetUIObject('c2cTag');
                    var texture = tag.GetTexture('tagColor');

                    this.refs.titleView = titleView;
                    this.refs.tagTitle = tagTitle;
                    this.refs.tag = tag;
                    this.refs.texture = texture;

                    var color = 0xFFF5F6FA;
                    var titleColor = 0xFF03081A;
                    var tagColor = 0xFF878B99;
                    var easyModel = global$s.getEasyModel(config);

                    if (easyModel) {
                        color = 0xFFFAFAFA;
                        titleColor = 0xFF000000;
                        tagColor = 0xFF999999;
                    }

                    titleView.SetTextColor(titleColor);
                    tagTitle.SetTextColor(tagColor);
                    texture.SetValue(color);
                },
                OnConfigChange() {

                },
                setTitle() {
                    var data = this.metaData.c2c;
                    var title = data.title;
                    var titleView = this.view.GetUIObject('c2cMainTitle');
                    titleView.SetValue(title);
                    this.refs.titleView = titleView;
                },
                setAvatar() {
                    var data = this.metaData.c2c;
                    var avatar = data.channel.guild_icon;
                    var avatarView = this.view.GetUIObject('image');
                    avatarView.SetValue(avatar);
                    this.refs.avatarView = avatarView;
                },

                UpdateRender() {
                    ArkWindow.console.time('c2c UpdateRender start');
                    this.renderView();
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                    ArkWindow.console.time('c2c UpdateRender end');
                },

                renderEmojiView(renderWidth, view, dataArr, maxLen) {
                    view.ClearChildren();
                    var size = this.fontSize;
                    var dashWidth = this.measureText('...', size);
                    var config = this.colorConfig;
                    var easyModel = global$s.getEasyModel(config);
                    var textColor = 0xFF999999;
                    if (easyModel) {
                        textColor = 0xFF878B99;
                    }

                    for (var i = 0; i < maxLen; i++) {
                        // 没数据了
                        if (!dataArr.length) {
                            return;
                        }

                        // 纯text很快渲染完毕。
                        var isAllText = this.isAllText(dataArr);
                        if (isAllText) {
                            var len = maxLen - i;
                            var measureTextView = this.measureTextView(textColor, size, len, dataArr);
                            view.AddChild(measureTextView);
                            var measureSize = measureTextView.MeasureTextSize();
                            var height = 0;
                            if (measureSize && measureSize.height) {
                                height = measureSize.height;
                            }
                            if (height) {
                                measureTextView.SetStyle('display: flex;width: 100%;height:' + height);
                                return;
                            }
                        }

                        if (i != maxLen - 1) {
                            this.renderDataView(renderWidth, view, dataArr, size, textColor);
                        } else {
                            this.renderDataView(renderWidth - dashWidth, view, dataArr, size, textColor);
                        }

                        //还有剩就追加...
                        if (dataArr.length && i == maxLen - 1) {
                            ArkWindow.console.time('view' + view.GetSize().height);
                            var textView = this.getTextView('...', this.fontSize, textColor);
                            view.AddChild(textView);
                            return;
                        }

                    }
                },
                measureTextView(color, font, len, dataArr) {
                    var textValue = this.getAllText(dataArr);
                    var text = UI.Text();
                    text.SetTextColor(color);
                    text.SetEllipsis(true);
                    text.SetMultiline(true);
                    text.SetAutoSize(true);
                    text.SetMaxline(len);
                    text.SetFont(font);
                    text.SetStyle('display: flex;width: 100%' + ';height: 1000');
                    text.SetValue(textValue);
                    text.Update();
                    return text;
                },
                renderDataView(renderWidth, view, dataArr, font, color) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    while (dataArr.length && width > 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {
                            // 有换行不处理哈
                            if (text == '\n') {
                                var emptyView = this.getEmptyView(width);
                                view.AddChild(emptyView);
                                width = 0;
                                return;
                            }

                            var textWidth = this.measureText(text, targetFont);
                            if (textWidth >= width) {
                                var maxRenderWidth = this.getMaxRenderLength(text, width, font);
                                if (maxRenderWidth < 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, targetFont, color);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, targetFont, color);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            var urlView = this.getLinkView(text, true);
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }

                        if (data.isLinkMember) {
                            if (text && text.length) {
                                if (text[0] === '@') {
                                    text = text.slice(1);
                                }
                            }

                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuild) {
                            if (text && text.length) {
                                if (text[0] === '#') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('#' + text);
                            var linkView = this.getLinkView('#' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var imageView = this.getEmojiView(data.url, data.id);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }

                        if (data.isEmpty && width > 2) {
                            var emptyView = this.getEmptyView(width);
                            view.AddChild(emptyView);
                            width = 0;
                            return true;
                        }
                    }
                },
                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    ArkWindow.console.time('render count: ' + (c + 2));

                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var text = UI.Text();
                    text.SetValue(textStr);
                    text.SetFont(size);
                    var size = text.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 8
                },
                getEmojiView(url, id) {
                    var imageView = UI.Image();
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('c2c-emoji');
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        var value = image.GetValue();
                        ArkWindow.console.warn(value + ' OnError');
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                        }
                    });
                },
                getEmptyView(width) {
                    var emptyView = UI.View();
                    var styleStr = 'display:flex;height:16;width:' + width;
                    emptyView.SetStyle(styleStr);
                    return emptyView;
                },
                getTextView(textStr, size, color) {
                    var textView = UI.Text();
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    if (color) {
                        textView.SetTextColor(color);
                    } else {
                        textView.SetTextColor(0xFFA2A5AC);
                    }
                    textView.SetStyle('c2c-desc-text-view');
                    return textView
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    this.views.push(view);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$s[template] && global$s[template].ViewModel && global$s[template].ViewModel.New) {
                        var model = global$s[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                getLinkView(textStr, isImage) {
                    ArkWindow.console.warn('isImage', textStr, !!isImage);
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: isImage
                        }
                    });
                    return linkView;
                },
                getTitle(data) {
                    var orgData = data;
                    if (orgData && orgData[0] && orgData[0].data && orgData[0].data[0] && orgData[0].data[0].text) {
                        return orgData[0].data[0].text;
                    }
                    return '';
                },
                polyfillFind(array) {
                    array.find = function(callback) {
                        for (var i = 0; i < array.length; i++) {
                            var find = callback(array[i]);
                            if (find) {
                                return array[i];
                            }
                        }
                    };
                },
                isAllText(dataArr) {
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        if (!item.isText) {
                            return false;
                        }
                    }
                    return true;
                },
                getAllText(dataArr) {
                    var text = '';
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        text += item.text;
                    }
                    return text;
                },
            }
        };
    })();

    var global$r = ArkWindow;
    (function(global) {

        var isAndroid = function() {
            if (arkWeb.System) {
                return arkWeb.System.GetOS() == "Android";
            }
            return false;
        };
        var isChannel = function() {
            // return true
            var view = this.view;
            var rootView = view.GetRoot();
            var containerInfo = {
                ChatType: -1
            };
            if (typeof QQ.GetContainerInfo === 'function') {
                containerInfo = QQ.GetContainerInfo(rootView);
            }
            var chatType = containerInfo.ChatType;
            ArkWindow.console.error('chatType', chatType);
            if (chatType == 7) {
                return true;
            }
            return false;
        };

        var isPreview = function() {
            var view = this.view;
            var rootView = view.GetRoot();
            var containerInfo = {
                ChatType: -1
            };
            if (typeof QQ.GetContainerInfo === 'function') {
                containerInfo = QQ.GetContainerInfo(rootView);
            }
            var chatType = containerInfo.ChatType;
            if (!chatType || chatType == -1) {
                ArkWindow.console.error('isPreview', true);
                return true;
            }
            return false;
        };
        var getAvatar = function(guildId) {
            return 'https://groupprohead-76292.picgzc.qpic.cn/' + guildId + '/140?t=' + Math.random();
        };
        global.isPreview = isPreview;
        global.isChannel = isChannel;
        global.isAndroid = isAndroid;
        global.getAvatar = getAvatar;
    })(global$r);

    var global$q = ArkWindow;
    (function(global) {
        var getDarkColorModel = function(config) {
            var themeConfig = config || ArkWindow.app.config;
            if (themeConfig) {
                var themeId = themeConfig.theme.themeId;
                if (themeId === '1102' || themeId === '2920' || themeId === '1103' || themeId === 1102 || themeId === 2920 || themeId === 1103) {
                    return true;
                }
                return false;
            }
            return false;
        };
        var getEasyModel = function(config) {
            var themeConfig = config;
            if (themeConfig && themeConfig.theme) {
                ArkWindow.console.warn('themeConfig', themeConfig.theme.mode);
                var model = themeConfig.theme.mode;
                if (model === 'concise') {
                    return true;
                }
                return false;
            }
            return false;
        };
        global.getDarkColorModel = getDarkColorModel;
        global.getEasyModel = getEasyModel;
    })(global$q);

    var global$p = ArkWindow;
    (function() {
        var appView = "qun";
        global$p[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.views = [];
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.detail) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }


                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.fontSize = 'size.14';

                    var hasImage = this.hasImage();

                    ArkWindow.console.error('hasImage', hasImage);
                    if (!hasImage) {
                        var data = this.metaData.detail;
                        this.generateC2C(data);
                        var view = this.view.GetRoot();
                        var model = ArkWindow.app.GetModel(view);
                        model && model.resetHeight && model.resetHeight.call(model);
                        model.shouldReset = true;
                        return;
                    }

                    this.colorConfig = ArkWindow.app.config;
                    this.securityBeat = this.metaData.detail.security_beat;
                    var view = this.view.GetRoot();
                    var hasEmpty = this.hasAllFeed();
                    if (hasEmpty) {
                        ArkWindow.app.UpdateRender(view);
                        return;
                    }
                    var key = this.metaData.detail.feed_id;
                    var data = this.getCacheFromKey(key);
                    if (data) {
                        this.metaData.detail.feed = data.content;
                        ArkWindow.app.UpdateRender(view);
                        // 强制刷新一下
                        var time = Date.now();
                        if (!data.time) {
                            ArkWindow.console.error('shouldRequest true');
                            this.request(false);
                            return;
                        }
                        var timeDistance = time - data.time;
                        // 30min 更新一下。
                        if (timeDistance > 1800 * 1000) {
                            ArkWindow.console.error('shouldRequest true');
                            this.request(false);
                        }
                        ArkWindow.console.error('shouldRequest false');
                        return;
                    }
                    ArkWindow.console.time('request');
                    this.request(true);
                },

                generateC2C(orgData) {
                    ArkWindow.console.time('startGenerateC2C');
                    var feed = orgData.feed;
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseData = global$p.parseFeed(feed, guildId);
                    var title = this.getTitle(parseData);
                    var dataArr = this.getRenderData(parseData);
                    var c2cView = this.generateView('c2c', {
                        c2c: {
                            channel: orgData.channel_info,
                            dataArr: dataArr,
                            title: title,
                        }
                    });
                    var view = this.view;
                    view.ClearChildren();
                    view.AddChild(c2cView);
                    // this.views.push(c2cView);
                    ArkWindow.console.time('endGenerateC2C');
                },

                hasImage() {
                    var data = this.metaData.detail;
                    var images = this.generateImage(data);

                    if (!images) {
                        return false;
                    }

                    if (!images.length) {
                        return false;
                    }

                    return true;
                },
                onClick() {
                    var data = this.metaData.detail;

                    var channelInfo = data.channel_info || {};
                    var view = this.view.GetRoot();

                    var posterTinyId = data.poster.str_tiny_id || data.poster.tiny_id;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var guildName = channelInfo.guild_name;
                    var channelName = channelInfo.channel_name;
                    var createTime = data.feed.create_time;
                    var baseUrl = data.jump_url;
                    var feedId = data.feed_id;
                    var inviteCode = data.invite_code;
                    var source = data.source;

                    var visitorTinyId = '';

                    if (QQ && QQ.GetTinyId) {
                        visitorTinyId = QQ.GetTinyId();
                    }

                    var linkUrlParams = this.getParams({
                        feedId: feedId,
                        createTime: createTime,
                        posterTinyId: posterTinyId,
                        visitorTinyId: visitorTinyId,
                        guildId: guildId,
                        channelId: channelId,
                        guildName: guildName,
                        channelName: channelName,
                        inviteCode: inviteCode,
                        source: source,
                    });

                    var linkUrl = baseUrl + linkUrlParams;

                    var shouldRedirect = this.shouldRedirect();
                    ArkWindow.console.warn('shouldRedirect', shouldRedirect);

                    if (shouldRedirect) {
                        linkUrl = this.redirectUrl(linkUrlParams);
                    }
                    ArkWindow.console.warn('linkUrl', linkUrl);

                    QQ && QQ.OpenUrl(linkUrl, view);
                },
                getParams(data) {
                    var feedId = data.feedId;
                    var createTime = data.createTime;
                    var posterTinyId = data.posterTinyId;
                    var visitorTinyId = data.visitorTinyId;
                    var guildId = data.guildId;
                    var channelId = data.channelId;
                    var guildName = data.guildName;
                    var channelName = data.channelName;
                    var inviteCode = data.inviteCode;
                    var source = data.source;
                    var params = '';

                    if (feedId) {
                        params = params + 'feed_id=' + this.encodeUrlParams(feedId);
                    }
                    if (inviteCode) {
                        params = params + '&';
                        params = params + 'invite_code=' + this.encodeUrlParams(inviteCode);
                    }
                    if (createTime) {
                        params = params + '&';
                        params = params + 'createtime=' + this.encodeUrlParams(createTime);
                    }
                    if (posterTinyId) {
                        params = params + '&';
                        params = params + 'poster_tinyid=' + this.encodeUrlParams(posterTinyId);
                    }
                    if (visitorTinyId) {
                        params = params + '&';
                        params = params + 'visitor_tinyid=' + this.encodeUrlParams(visitorTinyId);
                    }
                    if (guildId) {
                        params = params + '&';
                        params = params + 'guild_id=' + this.encodeUrlParams(guildId);
                    }
                    if (channelId) {
                        params = params + '&';
                        params = params + 'channel_id=' + this.encodeUrlParams(channelId);
                    }
                    if (guildName) {
                        params = params + '&';
                        params = params + 'guild_name=' + this.encodeUrlParams(guildName);
                    }
                    if (channelName) {
                        params = params + '&';
                        params = params + 'channel_name=' + this.encodeUrlParams(channelName);
                    }
                    if (source) {
                        params = params + '&';
                        params = params + 'source=' + this.encodeUrlParams(source);
                    }

                    if (!source) {
                        params = params + '&';
                        params = params + 'source=2';
                    }

                    if (source === 1) {
                        params = params + '&';
                        params = params + 'shareSource=' + 1;
                    }

                    if (source === 2) {
                        params = params + '&';
                        params = params + 'shareSource=' + 6;
                    }

                    if (!source) {
                        params = params + '&';
                        params = params + 'shareSource=' + 6;
                    }
                    return params;
                },
                encodeUrlParams(key) {
                    var keyStr = key + '';
                    if (Net && Net.UrlEncode) {
                        return Net.UrlEncode(keyStr);
                    }                return keyStr;
                },
                shouldRedirect() {
                    var version;
                    if (QQ && QQ.GetVersion) {
                        version = QQ.GetVersion();
                    }
                    var isTargetVersion = ArkWindow.util.isCurrentQQVersionBelowTargetVersion('8.8.50', version);
                    var isPc = arkWeb.System.GetOS() == 'Windows';
                    return isPc || isTargetVersion;
                },
                redirectUrl(params) {
                    return 'https://qun.qq.com/qqweb/qunpro/jump?_wv=3&_wwv=128&id=feed&' + params;
                },
                hasAllFeed() {
                    var feed = this.metaData.detail.feed;
                    ArkWindow.console.time('hasAllFeed: ' + !!feed.contents);
                    return !!feed.contents;
                },
                UpdateRender() {
                    var hasAllFeed = this.hasAllFeed();
                    if (!hasAllFeed) {
                        return;
                    }

                    var hasImage = this.hasImage();

                    if (hasImage) {
                        this.renderView();
                    }
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                },
                renderView() {
                    var data = this.metaData.detail;
                    this.generateRender(data);
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.UpdateRender();
                },
                generateRender(orgData) {
                    var feed = orgData.feed;
                    this.renderHeader();
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseData = global$p.parseFeed(feed, guildId);
                    var dataArr = this.getRenderData(parseData);
                    this.setFeedTitle(parseData);
                    this.generateFeed(dataArr);
                    this.renderImage(orgData);
                    var root = this.view.GetRoot();
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model);
                    model.shouldReset = true;
                },
                cacheImage(imageUrl, requestTime, callback) {
                    var data = arkWeb.Storage.Load(imageUrl);
                    var me = this;
                    if (data && data.width && data.height) {
                        ArkWindow.console.warn('cachedImage', imageUrl);
                        return callback(data);
                    }

                    ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                        if (err) {
                            ArkWindow.console.warn(imageUrl + ' OnError', err);
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        }

                        var img = UI.Image();
                        img.AttachEvent("OnError", function(sender) {
                            ArkWindow.console.warn(imageUrl, ' OnError');
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        });

                        img.AttachEvent("OnLoad", function(sender) {
                            ArkWindow.console.log(imageUrl + ' OnLoad');

                            var size = sender.GetSize();
                            ArkWindow.console.log('width: ' + size.width + ' height: ' + size.height);

                            arkWeb.Storage.Save(imageUrl, {
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                            callback({
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                        });

                        img.SetValue(path);
                    });
                },
                renderImage(parseData) {
                    var images = this.generateImage(parseData);
                    var targetImage;
                    var me = this;
                    var wrap = this.view.GetUIObject('qunFeedImage');
                    var contentWrap = this.view.GetUIObject('qunFeedImageWrap');

                    this.refs.qunFeedImage = wrap;
                    this.refs.qunFeedImageWrap = contentWrap;

                    if (images && images.length) {
                        targetImage = images[0];
                    }
                    if (!targetImage) {
                        contentWrap.SetVisible(false);
                        return;
                    }
                    var url = targetImage.pic_url;
                    contentWrap.SetVisible(true);
                    var requestTime = 3;
                    this.cacheImage(url, requestTime, function(data) {
                        if (!data || !data.path) {
                            ArkWindow.console.warn('no imageData', url);
                            return;
                        }
                        var path = data.path;
                        var width = data.width;
                        var height = data.height;
                        var radio = (width / height) || (1188 / 501);
                        var rootSize = wrap.GetSize();
                        var rootWidth = rootSize.width;
                        var rootHeight = rootSize.height;
                        var rootRadio = rootWidth / rootHeight;
                        var texture = wrap.GetUIObject('qunFeedImageTexture');
                        me.refs.qunFeedImageTexture = texture;
                        texture.SetValue(path);
                        if (rootRadio > radio) {
                            var width = rootWidth;
                            var height = rootWidth / radio;
                            var top = (height - rootHeight) / 2;
                            ArkWindow.console.warn(width, height);
                            texture.SetSize(width, height);
                            texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + width + ";height:" + height);
                        } else {
                            var width = rootHeight * radio;
                            var height = rootHeight;
                            var left = -1 * (width - rootWidth) / 2;
                            texture.SetSize(width, rootHeight);
                            texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + width + ";height:" + height);
                        }
                    });
                },
                renderHeader() {
                    var avatarView = this.view.GetUIObject('avatar');
                    var guildNameView = this.view.GetUIObject('guildName');

                    this.refs.avatarView = avatarView;
                    this.refs.guildNameView = guildNameView;

                    var channelInfo = this.metaData.detail.channel_info;
                    var guildId = channelInfo.str_guild_id;
                    var avatar = channelInfo.guild_icon || global$p.getAvatar(guildId);
                    var guildName = channelInfo.guild_name;

                    var colorConfig = this.colorConfig;
                    var isDark = global$p.getDarkColorModel(colorConfig);
                    var color = 0xFF999999;
                    var bgColor = 0xFFFFFFFF;
                    var tagColor = 0xFFFAFAFA;
                    if (isDark) {
                        color = 0xFFE8E9EA;
                        bgColor = 0xFF2D2D35;
                        tagColor = 0xFF2D2D35;
                    }
                    avatarView.SetValue(avatar);
                    guildNameView.SetValue(guildName);
                    guildNameView.SetTextColor(color);
                    var target = this.view.GetUIObject('qunFeedContentWrap');
                    this.refs.qunFeedContentWrap = target;
                    var texture = target.GetTexture('bgColor');
                    texture.SetValue(bgColor);
                    var tagTarget = this.view.GetUIObject('qunFeedTagWrap');
                    var targetTexture = tagTarget.GetTexture('bgColor1');
                    var targetText = tagTarget.GetUIObject('qunFeedTag');

                    this.refs.qunFeedTagWrap = tagTarget;
                    this.refs.bgColor1 = targetTexture;
                    this.refs.qunFeedTag = targetText;

                    targetTexture.SetValue(tagColor);
                    targetText.SetTextColor(color);
                    // var channelName = channelInfo.channel_name;            
                },
                generateFeed(dataArr) {
                    var view = this.view.GetUIObject('qunFeedText');

                    this.refs.qunFeedText = view;

                    view.ClearChildren();
                    var font = 'size.12';
                    var color = 0xFFA2A5AC;
                    var config = this.colorConfig;
                    var isDark = global$p.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFF838387;
                    }
                    var renderWidth = view.GetSize().width;
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                setFeedTitle(data) {
                    var view = this.view.GetUIObject('qunFeedTitle');

                    this.refs.qunFeedTitle = view;

                    view.ClearChildren();
                    var font = 'size.17';
                    var color = 0xFF03081A;
                    var config = this.colorConfig;
                    var isDark = global$p.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFFE8E9EA;
                    }
                    var title = this.getTitle(data);
                    var renderWidth = view.GetSize().width;
                    var dataArr = [{
                        isText: true,
                        text: title
                    }];
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                generateImage(requestData) {
                    var imgData = [];
                    if (requestData.feed.videos && requestData.feed.videos[0] && requestData.feed.videos[0].cover && requestData.feed.videos[0].cover.pic_url) {
                        imgData.push(requestData.feed.videos[0].cover);
                    }
                    if (requestData.feed.images && requestData.feed.images.length) {
                        imgData = imgData.concat(requestData.feed.images);
                    }
                    if (!imgData.length) {
                        return [];
                    }

                    this.replaceImages(imgData);
                    return imgData;
                },

                replaceImages(imgs) {
                    imgs.forEach(function(img) {
                        if (img && img.pic_url) {
                            img.pic_url = img.pic_url.replace('&t=7', '&t=5');
                        }
                    });
                },

                getRenderData(parseDatas) {
                    var orgData = parseDatas;
                    if (!orgData) {
                        return [];
                    }
                    var dataArr = this.mergeData(orgData);
                    return dataArr;
                },
                mergeData(orgData) {
                    var data = [];
                    for (var i = 1; i < orgData.length; i++) {
                        if (orgData[i] && orgData[i].data && orgData[i].data.length) {
                            orgData[i].data.forEach(function(item) {
                                data.push(item);
                            });
                        }
                    }
                    return data;
                },
                resetHeight() {},
                renderFirstData(renderWidth, view, dataArr, font, color) {
                    this.renderDataView(renderWidth, view, dataArr, font, color);
                },
                getEmoji(dataArr) {
                    var target = [];
                    dataArr.forEach(function(data) {
                        if (data.isText) {
                            var arr = global$p.parseEm(data.text);
                            target = target.concat(arr);
                            return;
                        }
                        target.push(data);
                    });
                    ArkWindow.console.warn('getEmoji', target);
                    return target;
                },
                renderSecondData(renderWidth, view, dataArr, font, color) {
                    var fontSize = font || this.fontSize;
                    var dashWidth = this.measureText('...', fontSize);
                    var shouldAppend = this.renderDataView(renderWidth - dashWidth, view, dataArr, fontSize, color);
                    if (dataArr.length && !shouldAppend) {
                        var textView = this.getTextView('...', fontSize, color);
                        view.AddChild(textView);
                        return
                    }
                },
                renderDataView(renderWidth, view, dataArr, font, color) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    while (dataArr.length && width >= 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        ArkWindow.console.warn('width', width, data);
                        if (data.isText) {
                            var textWidth = this.measureText(text, targetFont);
                            if (textWidth >= width) {
                                var maxRenderWidth = this.getMaxRenderLength(text, width, font);
                                if (maxRenderWidth < 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, targetFont, color);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, targetFont, color);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            ArkWindow.console.warn('url', urlWidth, width);
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }

                        if (data.isLinkMember) {
                            if (text && text.length) {
                                if (text[0] === '@') {
                                    text = text.slice(1);
                                }
                            }

                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuild) {
                            if (text && text.length) {
                                if (text[0] === '#') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('#' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('#' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var imageView = this.getEmojiView(data.url, data.id);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }

                        if (data.isEmpty && width > 2) {
                            var emptyView = this.getEmptyView(width);
                            view.AddChild(emptyView);
                            width = 0;
                            return true;
                        }
                    }
                },
                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    ArkWindow.console.time('render count: ' + (c + 2));

                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var text = UI.Text();
                    text.SetValue(textStr);
                    text.SetFont(size);
                    var size = text.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 14
                },
                getEmojiView(url, id) {
                    var imageView = UI.Image();
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji');
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        var value = image.GetValue();
                        ArkWindow.console.warn(value + ' OnError');
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                        }
                    });
                },
                getEmptyView(width) {
                    var emptyView = UI.View();
                    var styleStr = 'display:flex;height:auto;width:' + (width);
                    emptyView.SetStyle(styleStr);
                    return emptyView;
                },
                getTextView(textStr, size, color) {
                    var textView = UI.Text();
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    if (color) {
                        textView.SetTextColor(color);
                    } else {
                        textView.SetTextColor(0xFFA2A5AC);
                    }
                    return textView
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    this.views.push(view);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$p[template] && global$p[template].ViewModel && global$p[template].ViewModel.New) {
                        var model = global$p[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                getLinkView(textStr, isImage) {
                    ArkWindow.console.warn('isImage', textStr, !!isImage);
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: isImage
                        }
                    });
                    return linkView;
                },
                getTitle(data) {
                    var orgData = data;
                    if (orgData && orgData[0] && orgData[0].data && orgData[0].data[0] && orgData[0].data[0].text) {
                        return orgData[0].data[0].text;
                    }
                    return '';
                },
                polyfillFind(array) {
                    array.find = function(callback) {
                        for (var i = 0; i < array.length; i++) {
                            var find = callback(array[i]);
                            if (find) {
                                return array[i];
                            }
                        }
                    };
                },
                request(shouldUpdateUI) {
                    var http = Net.HttpRequest();
                    var view = this.view;
                    this.refs.qunView = view;
                    var me = this;
                    http.AttachEvent("OnComplete", function() {
                        var requestSuccess = http.IsSuccess();
                        var requestData = http.GetData();
                        http.DetachEvent('OnComplete');
                        ArkWindow.console.time('requestSuccess ' + requestSuccess + JSON.stringify(requestData, null, 2));
                        if (requestSuccess && requestData && requestData.feed) {
                            me.duration = requestData.duration || 10;
                            me.metaData.detail.feed = requestData.feed;
                            ArkWindow.console.error('feed_id', requestData.feed_id);
                            me.cache(requestData.feed);
                            if (shouldUpdateUI) {
                                ArkWindow.console.time('shouldUpdateUI ' + shouldUpdateUI);
                                ArkWindow.app.UpdateRender(view);
                            }
                            //继续请求。
                            ArkWindow.console.error('timeout');
                            return;
                        }
                        // 网络异常下次继续请求。
                        ArkWindow.console.error('timeout');
                    });
                    if (QQ && QQ.GetPskeyAsync) {
                        //这里后续考虑cache。
                        QQ.GetPskeyAsync("qun.qq.com", function(pskey) {
                            if (pskey) {
                                var data = me.getRequestParams();
                                var originUin = (QQ && QQ.GetUIN) ? QQ.GetUIN() : '';
                                var requestUrl = 'https://qun.qq.com/channel/cgi-bin/update-feeds-detail';
                                var puin = me.generatePuin(originUin + '');
                                var cookies = 'p_uin=' + puin + ';p_skey=' + pskey + ';uin=' + originUin;
                                http.SetHeader("Content-Type", "application/json");
                                http.SetCookie(cookies);
                                http.SetTimeout(30000);
                                ArkWindow.console.warn('data', data);
                                http.Post(requestUrl, data);
                            } else {
                                ArkWindow.console.warn("fail pskey");
                            }
                        });
                    }
                },
                cache(feed) {
                    var key = this.metaData.detail.feed_id;
                    var dataStr = JSON.stringify(feed);
                    arkWeb.Storage.Save(key, {
                        time: Date.now(),
                        content: dataStr
                    });
                },
                getCacheFromKey(key) {
                    var data = arkWeb.Storage.Load(key);
                    if (data && data.content) {
                        return {
                            content: JSON.parse(data.content),
                            time: data.time,
                        }
                    }
                    return null;
                },
                getRequestParams() {
                    var channelInfo = this.metaData.detail.channel_info;
                    var data = this.metaData.detail;
                    var feedId = data.feed_id;
                    var authorId = data.poster.str_tiny_id || data.poster.tiny_id;
                    var createTime = data.feed.create_time;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var createAt = data.create_at;
                    var token = data.token;
                    var requestData = {
                        feed_id: feedId,
                        author_id: authorId,
                        create_time: createTime,
                        detail_type: 2,
                        channel_sign: {
                            guild_id: guildId,
                            channel_id: channelId,
                        },
                        channel_share_sign: {
                            create_at: createAt,
                            token: token,
                        }
                    };
                    ArkWindow.console.time('requestData:' + JSON.stringify(requestData, null, 2));
                    return requestData;
                },
                generatePuin(originUin) {
                    var prefixStr = 'o';
                    var len = originUin.length;
                    var zeroLength = 0;

                    if (len < 10) {
                        zeroLength = 10 - len;
                    }

                    for (var i = 0; i < zeroLength; i += 1) {
                        prefixStr = prefixStr + '0';
                    }
                    return prefixStr + originUin;
                },
            }
        };
    })();

    var global$o = ArkWindow;
    (function() {
        var appView = "preview";
        global$o[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.views = [];
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.detail) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    this.fontSize = 'size.14';
                    this.colorConfig = ArkWindow.app.config;
                    var view = this.view.GetRoot();
                    ArkWindow.app.UpdateRender(view);
                },
                onClick() {
                    var data = this.metaData.detail;

                    var channelInfo = data.channel_info || {};
                    var view = this.view.GetRoot();

                    var posterTinyId = data.poster.str_tiny_id || data.poster.tiny_id;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var guildName = channelInfo.guild_name;
                    var channelName = channelInfo.channel_name;
                    var createTime = data.feed.create_time;
                    var baseUrl = data.jump_url;
                    var feedId = data.feed_id;

                    var visitorTinyId = '';

                    if (QQ && QQ.GetTinyId) {
                        visitorTinyId = QQ.GetTinyId();
                    }

                    var linkUrlParams = this.getParams({
                        feedId: feedId,
                        createTime: createTime,
                        posterTinyId: posterTinyId,
                        visitorTinyId: visitorTinyId,
                        guildId: guildId,
                        channelId: channelId,
                        guildName: guildName,
                        channelName: channelName
                    });

                    var linkUrl = baseUrl + linkUrlParams;

                    var shouldRedirect = this.shouldRedirect();
                    ArkWindow.console.warn('shouldRedirect', shouldRedirect);

                    if (shouldRedirect) {
                        linkUrl = this.redirectUrl(linkUrlParams);
                    }
                    ArkWindow.console.warn('linkUrl', linkUrl);

                    QQ && QQ.OpenUrl(linkUrl, view);
                },
                getParams(data) {
                    var feedId = data.feedId;
                    var createTime = data.createTime;
                    var posterTinyId = data.posterTinyId;
                    var visitorTinyId = data.visitorTinyId;
                    var guildId = data.guildId;
                    var channelId = data.channelId;
                    var guildName = data.guildName;
                    var channelName = data.channelName;
                    var params = '';


                    if (feedId) {
                        params = params + 'feed_id=' + this.encodeUrlParams(feedId);
                    }
                    if (createTime) {
                        params = params + '&';
                        params = params + 'createtime=' + this.encodeUrlParams(createTime);
                    }
                    if (posterTinyId) {
                        params = params + '&';
                        params = params + 'poster_tinyid=' + this.encodeUrlParams(posterTinyId);
                    }
                    if (visitorTinyId) {
                        params = params + '&';
                        params = params + 'visitor_tinyid=' + this.encodeUrlParams(visitorTinyId);
                    }
                    if (guildId) {
                        params = params + '&';
                        params = params + 'guild_id=' + this.encodeUrlParams(guildId);
                    }
                    if (channelId) {
                        params = params + '&';
                        params = params + 'channel_id=' + this.encodeUrlParams(channelId);
                    }
                    if (guildName) {
                        params = params + '&';
                        params = params + 'guild_name=' + this.encodeUrlParams(guildName);
                    }
                    if (channelName) {
                        params = params + '&';
                        params = params + 'channel_name=' + this.encodeUrlParams(channelName);
                    }
                    return params;
                },
                encodeUrlParams(key) {
                    var keyStr = key + '';
                    if (Net && Net.UrlEncode) {
                        return Net.UrlEncode(keyStr);
                    }                return keyStr;
                },
                shouldRedirect() {
                    var version;
                    if (QQ && QQ.GetVersion) {
                        version = QQ.GetVersion();
                    }
                    var isTargetVersion = ArkWindow.util.isCurrentQQVersionBelowTargetVersion('8.8.38', version);
                    var isPc = arkWeb.System.GetOS() == 'Windows';
                    return isPc || isTargetVersion;
                },
                redirectUrl(params) {
                    return 'https://qun.qq.com/qqweb/qunpro/jump?_wv=3&_wwv=128&id=feed&' + params;
                },
                UpdateRender() {
                    this.renderView();
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                },
                renderView() {
                    var data = this.metaData.detail;
                    this.generateRender(data);
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.UpdateRender();
                },
                generateRender(orgData) {
                    var feed = orgData.feed;
                    this.renderHeader();
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseData = global$o.parseFeed(feed, guildId);
                    var dataArr = this.getRenderData(parseData);
                    this.setFeedTitle(parseData);
                    this.generateFeed(dataArr);
                    this.renderImage(orgData);
                    var root = this.view.GetRoot();
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model);
                },
                cacheImage(imageUrl, requestTime, callback) {
                    var data = arkWeb.Storage.Load(imageUrl);
                    var me = this;
                    if (data && data.width && data.height) {
                        ArkWindow.console.warn('cachedImage', imageUrl);
                        return callback(data);
                    }

                    ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                        if (err) {
                            ArkWindow.console.warn(imageUrl + ' OnError', err);
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        }

                        var img = UI.Image();
                        img.AttachEvent("OnError", function(sender) {
                            ArkWindow.console.warn(imageUrl, ' OnError');
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        });

                        img.AttachEvent("OnLoad", function(sender) {
                            ArkWindow.console.log(imageUrl + ' OnLoad');

                            var size = sender.GetSize();
                            ArkWindow.console.log('width: ' + size.width + ' height: ' + size.height);

                            arkWeb.Storage.Save(imageUrl, {
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                            callback({
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                        });

                        img.SetValue(path);
                    });
                },
                renderImage(parseData) {
                    var images = this.generateImage(parseData);
                    var targetImage;
                    var me = this;
                    var wrap = this.view.GetUIObject('previewFeedImage');
                    var contentWrap = this.view.GetUIObject('previewFeedImageWrap');

                    this.refs.wrap = wrap;
                    this.refs.contentWrap = contentWrap;
                    if (images && images.length) {
                        targetImage = images[0];
                    }
                    if (!targetImage) {
                        contentWrap.SetVisible(false);
                        return;
                    }
                    var url = targetImage.pic_url;
                    contentWrap.SetVisible(true);
                    var requestTime = 3;
                    this.cacheImage(url, requestTime, function(data) {
                        if (!data || !data.path) {
                            ArkWindow.console.warn('no imageData', url);
                            return;
                        }
                        var path = data.path;
                        var width = data.width;
                        var height = data.height;
                        var radio = (width / height) || (1188 / 501);
                        var rootSize = wrap.GetSize();
                        var rootWidth = rootSize.width;
                        var rootHeight = rootSize.height;
                        var rootRadio = rootWidth / rootHeight;
                        var texture = wrap.GetUIObject('previewFeedImageTexture');
                        me.refs.previewFeedImageTexture = texture;
                        texture.SetValue(path);
                        if (rootRadio > radio) {
                            var width = rootWidth;
                            var height = rootWidth / radio;
                            var top = (height - rootHeight) / 2;
                            ArkWindow.console.warn(width, height);
                            texture.SetSize(width, height);
                            texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + width + ";height:" + height);
                        } else {
                            var width = rootHeight * radio;
                            var height = rootHeight;
                            var left = -1 * (width - rootWidth) / 2;
                            texture.SetSize(width, rootHeight);
                            texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + width + ";height:" + height);
                        }
                    });
                },
                renderHeader() {
                    var avatarView = this.view.GetUIObject('avatar');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var channelNameView = this.view.GetUIObject('channelName');
                    var space = this.view.GetUIObject('headerRightSpace');
                    var spaceTexture = space.GetTexture('spaceColor');

                    this.refs.avatarView = avatarView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.channelNameView = channelNameView;
                    this.refs.space = space;
                    this.refs.spaceTexture = spaceTexture;

                    var guildId = this.metaData.detail.channel_info.str_guild_id;

                    var channelInfo = this.metaData.detail.channel_info;
                    var avatar = this.metaData.detail.channel_info.guild_icon || global$o.getAvatar(guildId);
                    var guildName = channelInfo.guild_name;
                    var channelName = channelInfo.channel_name;

                    var colorConfig = this.colorConfig;
                    var isDark = global$o.getDarkColorModel(colorConfig);
                    var color = 0xFF999999;
                    var bgColor = 0xFFFFFFFF;
                    var tagColor = 0xFFFFFFFF;
                    if (isDark) {
                        color = 0xFFE8E9EA;
                        bgColor = 0xFF2D2D35;
                        tagColor = 0xFF2D2D35;
                    }
                    avatarView.SetValue(avatar);
                    guildNameView.SetValue(guildName);
                    channelNameView.SetValue(channelName);
                    guildNameView.SetTextColor(color);
                    channelNameView.SetTextColor(color);
                    spaceTexture.SetValue(color);
                    var target = this.view.GetUIObject('previewFeedContentWrap');
                    this.refs.previewFeedContentWrap = target;
                    var texture = target.GetTexture('bgColor');
                    this.refs.bgColor = texture;
                    texture.SetValue(bgColor);
                    var tagTarget = this.view.GetUIObject('previewFeedTagWrap');
                    var targetTexture = tagTarget.GetTexture('bgColor1');
                    var targetText = tagTarget.GetUIObject('previewFeedTag');

                    this.refs.previewFeedTagWrap = tagTarget;
                    this.refs.targetTexture = targetTexture;
                    this.refs.previewFeedTag = targetText;

                    targetTexture.SetValue(tagColor);
                    targetText.SetTextColor(color);
                    // var channelName = channelInfo.channel_name;            
                },
                generateFeed(dataArr) {
                    var view = this.view.GetUIObject('previewFeedText');
                    this.refs.previewFeedText = view;
                    view.ClearChildren();
                    var font = 'size.12';
                    var color = 0xFFA2A5AC;
                    var config = this.colorConfig;
                    var isDark = global$o.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFF838387;
                    }
                    var renderWidth = view.GetSize().width;
                    ArkWindow.console.time('renderWidth ' + renderWidth);
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                setFeedTitle(data) {
                    var view = this.view.GetUIObject('previewFeedTitle');
                    this.refs.previewFeedTitle = view;
                    view.ClearChildren();
                    var font = 'size.14';
                    var color = 0xFF222222;
                    var config = this.colorConfig;
                    var isDark = global$o.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFFE8E9EA;
                    }
                    var title = this.getTitle(data);
                    var renderWidth = view.GetSize().width;
                    var dataArr = [{
                        isText: true,
                        text: title
                    }];
                    ArkWindow.console.time('setFeedTitle ' + renderWidth);
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                generateImage(requestData) {
                    var imgData = [];
                    if (requestData.feed.videos && requestData.feed.videos[0] && requestData.feed.videos[0].cover && requestData.feed.videos[0].cover.pic_url) {
                        imgData.push(requestData.feed.videos[0].cover);
                    }
                    if (requestData.feed.images && requestData.feed.images.length) {
                        imgData = imgData.concat(requestData.feed.images);
                    }
                    if (!imgData.length) {
                        return [];
                    }
                    this.replaceImages(imgData);
                    return imgData;
                },

                replaceImages(imgs) {
                    imgs.forEach(function(img) {
                        if (img && img.pic_url) {
                            img.pic_url = img.pic_url.replace('&t=7', '&t=5');
                        }
                    });
                },

                getRenderData(parseDatas) {
                    var orgData = parseDatas;
                    var dataArr = this.mergeData(orgData);
                    return dataArr;
                },
                mergeData(orgData) {
                    var data = [];
                    for (var i = 1; i < orgData.length; i++) {
                        if (orgData[i] && orgData[i].data && orgData[i].data.length) {
                            orgData[i].data.forEach(function(item) {
                                data.push(item);
                            });
                        }
                    }
                    return data;
                },
                resetHeight() {},
                renderFirstData(renderWidth, view, dataArr, font, color) {
                    this.renderDataView(renderWidth, view, dataArr, font, color);
                },
                getEmoji(dataArr) {
                    var target = [];
                    dataArr.forEach(function(data) {
                        if (data.isText) {
                            var arr = global$o.parseEm(data.text);
                            target = target.concat(arr);
                            return;
                        }
                        target.push(data);
                    });
                    ArkWindow.console.warn('getEmoji', target);
                    return target;
                },
                renderSecondData(renderWidth, view, dataArr, font, color) {
                    var fontSize = font || this.fontSize;
                    var dashWidth = this.measureText('...', fontSize);
                    var shouldAppend = this.renderDataView(renderWidth - dashWidth, view, dataArr, fontSize, color);
                    if (dataArr.length && !shouldAppend) {
                        var textView = this.getTextView('...', fontSize, color);
                        view.AddChild(textView);
                        return
                    }
                },
                renderDataView(renderWidth, view, dataArr, font, color) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    while (dataArr.length && width >= 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {
                            var textWidth = this.measureText(text, targetFont);
                            if (textWidth >= width) {

                                var maxRenderWidth = this.getMaxRenderLength(text, width, targetFont);
                                if (maxRenderWidth <= 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, targetFont, color);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, targetFont, color);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            ArkWindow.console.warn('url', urlWidth, width);
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }

                        if (data.isLinkMember) {
                            if (text && text.length) {
                                if (text[0] === '@') {
                                    text = text.slice(1);
                                }
                            }

                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuild) {
                            if (text && text.length) {
                                if (text[0] === '#') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('#' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('#' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var imageView = this.getEmojiView(data.url, data.id);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }

                        if (data.isEmpty && width > 2) {
                            var emptyView = this.getEmptyView(width);
                            view.AddChild(emptyView);
                            width = 0;
                            return true;
                        }
                    }
                },
                getMaxRenderLength1(text, width, fontSize) {
                    var startLen = 0;
                    while (startLen <= text.length) {
                        var newStr = text.slice(0, startLen);
                        var newWidth = this.measureText(newStr, fontSize);

                        if (newWidth == width) {
                            return startLen;
                        }

                        if (newWidth > width) {
                            return startLen - 1;
                        }
                        startLen++;
                    }
                    return text.length;
                },
                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    ArkWindow.console.time('render count: ' + (c + 2));

                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    if (newWidthL > width) {
                        return l - 1;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var text = UI.Text();
                    text.SetValue(textStr);
                    text.SetFont(size);
                    var size = text.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 8
                },
                getEmojiView(url, id) {
                    var imageView = UI.Image();
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji');
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        var value = image.GetValue();
                        ArkWindow.console.warn(value + ' OnError');
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                        }
                    });
                },
                getEmptyView(width) {
                    var emptyView = UI.View();
                    var styleStr = 'display:flex;height:14;width:' + (width);
                    emptyView.SetStyle(styleStr);
                    return emptyView;
                },
                getTextView(textStr, size, color) {
                    var textView = UI.Text();
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    if (color) {
                        textView.SetTextColor(color);
                    } else {
                        textView.SetTextColor(0xFFA2A5AC);
                    }
                    return textView
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    this.views.push(view);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$o[template] && global$o[template].ViewModel && global$o[template].ViewModel.New) {
                        var model = global$o[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                getLinkView(textStr, isImage) {
                    ArkWindow.console.warn('isImage', textStr, !!isImage);
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: isImage
                        }
                    });
                    return linkView;
                },
                getTitle(data) {
                    var orgData = data;
                    if (orgData && orgData[0] && orgData[0].data && orgData[0].data[0] && orgData[0].data[0].text) {
                        return orgData[0].data[0].text;
                    }
                    return '';
                },
                polyfillFind(array) {
                    array.find = function(callback) {
                        for (var i = 0; i < array.length; i++) {
                            var find = callback(array[i]);
                            if (find) {
                                return array[i];
                            }
                        }
                    };
                }
            }
        };
    })();

    var global$n = ArkWindow;
    (function() {
        var appView = "emoji";
        global$n[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    this.colorConfig = ArkWindow.app.config;
                    this.refs = {};
                    this.savaViews = [];
                    this.fontSize = 'size.12';
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.hasUpdateRender = false;
                    this.UpdateRender();
                },
                // resetHeight 做增量渲染。
                UpdateRender() {
                    if (this.hasUpdateRender) {
                        return;
                    }
                    ArkWindow.console.time('emoji UpdateRender start');
                    this.hasUpdateRender = true;
                    var view = this.view.GetUIObject('emojiFeedContent');
                    this.refs.emojiFeedContent = view;
                    view.ClearChildren();
                    var renderWidth = this.view.GetSize().width;
                    var dataArr = this.getRenderData();
                    var maxLen = this.metaData.data.maxLine;
                    this.fontSize = this.metaData.data.font || this.fontSize;
                    this.renderEmojiView(renderWidth, view, dataArr, maxLen);
                    ArkWindow.console.time('emoji UpdateRender end');
                },
                getRenderData() {
                    var orgData = this.metaData.data.text;
                    var root = this.view.GetRoot();
                    var rootModel = ArkWindow.app.GetModel(root);
                    var guildId = '';
                    if (rootModel && rootModel.metaData && rootModel.metaData.detail && rootModel.metaData.detail.channel_info) {
                        guildId = rootModel.metaData.detail.channel_info.str_guild_id;
                    }
                    return global$n.parseFeedComment(orgData, guildId);
                },
                renderEmojiView(renderWidth, view, dataArr, maxLen) {
                    view.ClearChildren();
                    var size = this.fontSize;
                    var dashWidth = this.measureText('...', size);

                    var textColor = 0xFF333333;
                    var config = this.colorConfig || ArkWindow.app.config;
                    var dark = global$n.getDarkColorModel(config);
                    if (dark) {
                        textColor = 0xFFE8E9EA;
                    }

                    for (var i = 0; i < maxLen; i++) {
                        // 没数据了
                        if (!dataArr.length) {
                            return;
                        }
                        if (i != maxLen - 1) {
                            this.renderDataView(renderWidth, view, dataArr, size, textColor);
                        } else {
                            this.renderDataView(renderWidth - dashWidth, view, dataArr, size, textColor);
                        }

                        //还有剩就追加...
                        if (dataArr.length && i == maxLen - 1) {
                            var textView = this.getTextView('...', this.fontSize, textColor);
                            view.AddChild(textView);
                            return;
                        }

                    }
                },
                isAllText(dataArr) {
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        if (!item.isText) {
                            return false;
                        }
                    }
                    return true;
                },
                getAllText(dataArr) {
                    var text = '';
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        text += item.text;
                    }
                    return text;
                },
                renderDataView(renderWidth, view, dataArr, size, color) {
                    var width = renderWidth;
                    var renderSize = size || this.fontSize;

                    var isAllText = this.isAllText(dataArr);

                    if (isAllText) {
                        var newText = this.getAllText(dataArr);
                        var textView = this.getTextView(newText, renderSize, color);
                        textView.SetStyle('emoji-feed-content-text');
                        view.AddChild(textView);
                        textView.SetEllipsis(true);
                        dataArr.splice(0, dataArr.length);
                        return;
                    }

                    while (dataArr.length) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {
                            var textWidth = this.measureText(text, renderSize);
                            if (textWidth >= width) {
                                var maxRenderWidth = this.getMaxRenderLength(text, width, renderSize);
                                if (maxRenderWidth <= 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, renderSize, color);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, renderSize, color);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }
                        if (data.isLinkMember) {
                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuilld) {
                            var linkWidth = this.measureLink('#' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView(text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }
                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var imageView = this.getEmojiView(data.url, data.id);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }
                    }
                },
                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    ArkWindow.console.time('render count: ' + (c + 2));

                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    ArkWindow.console.time('render str: ' + newStrL + 'width: ' + newWidthL);
                    ArkWindow.console.time('render str: ' + newStrR + 'width: ' + newWidthR);

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var text = this.measureTextUI;
                    if (!text) {
                        this.measureTextUI = UI.Text();
                        text = this.measureTextUI;
                    }
                    text.SetValue(textStr);
                    text.SetFont(size);
                    var size = text.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 8
                },
                getEmojiView(url, id) {
                    var imageView = UI.Image();
                    this.savaViews.push(imageView);
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji');
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    ArkWindow.console.warn('id', id);
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        var value = image.GetValue();
                        ArkWindow.console.warn(value + ' OnError');
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                            return;
                        }
                        var lastUrl = 'https://framework.cdn-go.cn/qqmoji/latest/sysface/static/s' + id + '.png';
                        image.SetValue(lastUrl);
                    });
                },
                getTextView(textStr, size, color) {
                    var textView = UI.Text();
                    this.savaViews.push(textView);
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    var colorStr = color || 0xFF333333;
                    textView.SetTextColor(colorStr);
                    return textView
                },
                getLinkView(textStr) {
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: false,
                        }
                    });
                    return linkView;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$n[template] && global$n[template].ViewModel && global$n[template].ViewModel.New) {
                        var model = global$n[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
            }
        };
    })();

    var global$m = ArkWindow;
    (function(global) {
        global.mockData = {
            "feed": {
                "emotion_reaction": {
                    "emoji_reaction_list": [{
                        "emoji_id": "311",
                        "emoji_type": 1,
                        "cnt": 4
                    }, {
                        "emoji_id": "76",
                        "emoji_type": 1,
                        "cnt": 3
                    }, {
                        "emoji_id": "271",
                        "emoji_type": 1,
                        "cnt": 3
                    }]
                },
                "emotion_total_count": 10,
                "prefer_count": 5,
                "view_count": 100,
                "vec_comment": [{
                    "post_user": {
                        "nick": "嘿嘿"
                    },
                    "content": "默契值"
                }, {
                    "post_user": {
                        "nick": "嘿嘿"
                    },
                    "content": "更新"
                }],
                "comment_count": 6,
                "title": {
                    "contents": [{
                        "type": 1,
                        "text_content": {
                            "text": "哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈啊哈哈哈哈哈哈"
                        }
                    }]
                },
                "contents": {
                    "contents": [{
                        "type": 1,
                        "text_content": {
                            "text": "明哦咯咯给你你仔细明儿地名咩地哦哟老榆木多顶你我忍碰预约明哦咯咯给你你仔细明儿地名咩地哦哟老榆木多顶你我忍碰预约明哦咯咯给你你仔细明儿地名咩地哦哟老榆木多顶你我忍碰预约"
                        }
                    }]
                },
                "pattern_info": "[{\"id\":\"textTitle\",\"type\":\"paragraph\",\"data\":[{\"type\":1,\"text\":\"哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈啊哈哈哈哈哈哈\"}]},{\"id\":\"GY4rvaqGSH\",\"type\":\"paragraph\",\"data\":[{\"type\":1,\"text\":\"明哦咯咯给你你仔细明儿地名咩地哦哟老榆木多顶你我忍碰预约明哦咯咯给你你仔细明儿地名咩地哦哟老榆木多顶你我忍碰预约明哦咯咯给你你仔细明儿地名咩地哦哟老榆木多顶你我忍碰预约\"}]},{\"id\":\"DNyMMSK8LY\",\"type\":\"VEDIO\",\"data\":{\"type\":7,\"width\":720,\"height\":1520,\"duration\":24380,\"fileId\":\"\",\"url\":\"/guildFeedPublish/localMedia/data/user/0/com.tencent.mobileqq/files/guild/thumbs/-399636858.nomedia\",\"id\":\"o2784019491_2021_10_20_16_24_23_f0a5ace3fbb55fa7\",\"taskId\":\"GuildSon95956750832564\"}},{\"id\":\"dPUtUpFfsU\",\"type\":\"paragraph\",\"data\":[]}]",
                "videos": [{
                    "cover": {
                        "width": 720,
                        "height": 1520,
                        "pic_url": "http://world.qpic.cn/psc?/world/O0cFsaTfOlqjIAnYAvw8WgvKeyQwEnvJHr6sdoIWOMY2MrpRj7R5K4UXxAm9VtVwAMKgQ4X1X4NBWcPIpeWDHNM2wehAA3gx*7Z4C38tdiQ!/b\u0026bo=0ALwBdAC8AURHyg!\u0026ek=1\u0026tl=1\u0026tm=1634822770\u0026vuin=1211636825"
                    },
                    "pattern_id": "o2784019491_2021_10_20_16_24_23_f0a5ace3fbb55fa7"
                }],
                "create_time": 1634718272
            },
            "duration": 25
        };
    })(global$m);

    var global$l = ArkWindow;
    (function() {
        var appView = "text";
        global$l[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    this.view.hasUpdate = true;
                    this.colorConfig = ArkWindow.app.config;
                    this.refs = {};
                    this.fontSize = 'size.16';
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.hasUpdateRender = false;
                    this.UpdateRender();
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$l[template] && global$l[template].ViewModel && global$l[template].ViewModel.New) {
                        var model = global$l[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                updateDartView() {},
                UpdateRender() {
                    this.refs = {};
                    var orgData = this.metaData.data;

                    if (!orgData) {
                        return;
                    }

                    // 标识位
                    if (this.hasUpdateRender) {
                        return;
                    }
                    this.hasUpdateRender = true;
                    this.temViews = [];

                    ArkWindow.console.time('textView UpdateRender start');
                    this.setFeedTitle();
                    var view = this.view.GetUIObject('feedContent');
                    view.ClearChildren();
                    this.refs.feedContentView = view;
                    var dataArr = this.getRenderData();
                    var renderWidth = view.GetSize().width;
                    ArkWindow.console.time('textView render renderFirstData');
                    this.renderFirstData(renderWidth, view, dataArr, 'size.13', 0xFFA2A5AC);
                    ArkWindow.console.time('textView render renderSecondData');
                    this.renderSecondData(renderWidth, view, dataArr, 'size.13', 0xFFA2A5AC);
                    ArkWindow.console.time('textView render end');
                },
                getRenderData() {
                    var orgData = this.metaData.data;
                    var dataArr = this.mergeData(orgData);
                    return dataArr;
                },
                mergeData(orgData) {
                    var data = [];
                    if (!orgData) {
                        return [];
                    }
                    for (var i = 1; i < orgData.length; i++) {
                        if (orgData[i] && orgData[i].data && orgData[i].data.length) {
                            orgData[i].data.forEach(function(item) {
                                data.push(item);
                            });
                        }
                    }
                    return data;
                },
                renderFirstData(renderWidth, view, dataArr, font, color) {
                    var margin = global$l.isAndroid() ? 4 : 0;
                    this.renderDataView(renderWidth, view, dataArr, font, color, margin, false);
                },
                getEmoji(dataArr) {
                    var target = [];
                    dataArr.forEach(function(data) {
                        if (data.isText) {
                            var arr = global$l.parseEm(data.text);
                            target = target.concat(arr);
                            return;
                        }
                        target.push(data);
                    });
                    ArkWindow.console.warn('getEmoji', target);
                    return target;
                },
                isAllText(dataArr) {
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        if (!item.isText) {
                            return false;
                        }
                    }
                    return true;
                },
                getAllText(dataArr) {
                    var text = '';
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        text += item.text;
                    }
                    return text;
                },
                renderSecondData(renderWidth, view, dataArr, font, color) {
                    var fontSize = font || this.fontSize;
                    var dashWidth = this.measureText('...', fontSize);
                    var shouldAppend = this.renderDataView(renderWidth - dashWidth, view, dataArr, fontSize, color, 0, true);
                    if (dataArr.length && !shouldAppend) {
                        var textView = this.getTextView('...', fontSize, color, 0);
                        view.AddChild(textView);
                        return
                    }
                },
                renderDataView(renderWidth, view, dataArr, font, color, margin, setText) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    var marginStr = margin || 0;

                    var isAllText = false;

                    if (setText) {
                        isAllText = this.isAllText(dataArr);
                    }

                    if (isAllText) {
                        var newText = this.getAllText(dataArr);
                        var textView = this.getTextView(newText, targetFont, color, marginStr);
                        textView.SetStyle('emoji-feed-content-text');
                        view.AddChild(textView);
                        textView.SetEllipsis(true);
                        dataArr.splice(0, dataArr.length);
                        return;
                    }

                    while (dataArr.length && width >= 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {

                            // 有换行不处理哈
                            if (text == '\n') {
                                var emptyView = this.getEmptyView(width);
                                view.AddChild(emptyView);
                                width = 0;
                                return;
                            }
                            var textWidth = this.measureText(text, targetFont);
                            if (textWidth >= width) {
                                var maxRenderWidth = this.getMaxRenderLength(text, width, targetFont);
                                if (maxRenderWidth <= 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, targetFont, color, marginStr);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, targetFont, color, marginStr);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true, marginStr);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }

                        if (data.isLinkMember) {
                            if (text && text.length) {
                                if (text[0] === '@') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text, false, marginStr);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuild) {
                            if (text && text.length) {
                                if (text[0] === '#') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('#' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('#' + text, false, marginStr);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            ArkWindow.console.warn('error', data, data.id);
                            var imageView = this.getEmojiView(data.url, data.id, marginStr);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }

                        if (data.isEmpty && width > 2) {
                            var emptyView = this.getEmptyView(width);
                            view.AddChild(emptyView);
                            width = 0;
                            return true;
                        }
                    }
                },

                getMaxRenderLength1(text, width, fontSize) {
                    var startLen = 0;
                    while (startLen <= text.length) {
                        var newStr = text.slice(0, startLen);
                        var newWidth = this.measureText(newStr, fontSize);

                        if (newWidth == width) {
                            return startLen;
                        }

                        if (newWidth > width) {
                            return startLen - 1;
                        }
                        startLen++;
                    }
                    return text.length;
                },

                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    ArkWindow.console.time('render count: ' + (c + 2));

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var textUI = this.measureTextUI;
                    if (!textUI) {
                        textUI = UI.Text();
                        this.measureTextUI = textUI;
                    }
                    textUI.SetValue(textStr);
                    textUI.SetFont(size);
                    var size = textUI.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 8
                },
                getEmojiView(url, id, margin) {
                    var imageView = UI.Image();
                    this.temViews.push(imageView);
                    imageView.SetValue(url);
                    var imageView = UI.Image();
                    this.temViews.push(imageView);
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji');
                    if (margin) {
                        imageView.SetStyle('emoji-margin');
                    }
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                        }
                    });
                },
                getEmptyView(width) {
                    var emptyView = UI.View();
                    this.temViews.push(emptyView);
                    var styleStr = 'display:flex;height:16;width:' + (width - 2);
                    emptyView.SetStyle(styleStr);
                    return emptyView;
                },
                getTextView(textStr, size, color, margin) {
                    var textView = UI.Text();
                    this.temViews.push(textView);
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    if (color) {
                        textView.SetTextColor(color);
                    } else {
                        textView.SetTextColor(0xFFA2A5AC);
                    }
                    if (margin) {
                        textView.SetStyle('feed-content-margin');
                    } else {
                        textView.SetStyle('feed-content-text');
                    }
                    return textView
                },
                getLinkView(textStr, img, margin) {
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: img,
                            margin: margin
                        }
                    });
                    return linkView;
                },
                setFeedTitle() {
                    var font = 'size.17';
                    var title = this.getTitle();
                    var renderWidth = this.view.GetSize().width;
                    var view = this.view.GetUIObject('feedTitleWrap');
                    this.refs.feedTitleWrap = view;
                    if (global$l.isAndroid()) {
                        view.SetStyle('feed-title-wrap-android');
                        font = 'size.17';
                    }
                    view.ClearChildren();
                    var dataArr = [{
                        isText: true,
                        text: title
                    }];
                    var config = this.colorConfig || ArkWindow.app.config;
                    var isDark = global$l.getDarkColorModel(config);
                    var color = 0xFF222222;
                    if (isDark) {
                        color = 0xFFE8E9EA;
                    }
                    this.renderFirstData(renderWidth, view, dataArr, font, color);
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                getTitle() {
                    var orgData = this.metaData.data;
                    if (orgData && orgData[0] && orgData[0].data && orgData[0].data[0] && orgData[0].data[0].text) {
                        return orgData[0].data[0].text;
                    }
                    return '';
                }
            }
        };
    })();

    var global$k = ArkWindow;
    (function() {
        var appView = "header";
        global$k[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "header");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    ArkWindow.console.time('header start Render');
                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.setViewValue(this.metaData.data);
                    this.colorConfig = ArkWindow.app.config;
                    this.setDarkModel();
                    if (global$k.isAndroid()) {
                        var publishView = this.view.GetUIObject('publish');
                        var headerTop = this.view.GetUIObject('headerRightTop');
                        var spaceView = this.view.GetUIObject('headerSpace');
                        this.refs.publishView = publishView;
                        this.refs.headerTop = headerTop;
                        this.refs.spaceView = spaceView;
                        headerTop.SetStyle('header-right-top-android');
                        publishView.SetFont('size.12');
                        spaceView.SetStyle('forum-space-android');
                        this.view.SetStyle('forum-header-wrap-android');
                    }                this.setHasEmoji();
                    ArkWindow.console.time('header start Render end');
                },
                setHasEmoji() {
                    var channelInfo = this.metaData.data.channel_info;
                    var channelName = channelInfo.channel_name;
                    var poster = this.metaData.data.poster;
                    var createTime = this.metaData.data.feed.create_time;

                    var channelName = channelInfo.channel_name;
                    var guildName = channelInfo.guild_name;
                    var nick = poster.nick;
                    var publishTimeStr = this.getCreateTimeStr(createTime);
                    var publishStr = nick + ' ' + publishTimeStr;
                    // 解决有emoji文字会被往下挤错位
                    if (global$k.hasEmoji(guildName)) {
                        // 标题包含emoji
                        var guildNameView = this.view.GetUIObject('guildName');
                        guildNameView.SetStyle('guild-name-has-emoji');
                        if (global$k.isAndroid()) {
                            headerRightTop.SetStyle('header-right-top-has-emoji-android');
                            guildNameView.SetStyle('guild-name-has-emoji-android');
                        }

                    }
                    if (global$k.hasEmoji(channelName)) {
                        var channelNameView = this.view.GetUIObject('channelName');
                        channelNameView.SetStyle('channel-name-has-emoji');
                        if (global$k.isAndroid()) {
                            channelNameView.SetStyle('channel-name-has-emoji-android');
                        }
                    }
                    if (global$k.hasEmoji(guildName) || global$k.hasEmoji(channelName) || global$k.hasEmoji(publishStr)) {
                        var publishView = this.view.GetUIObject('publish');
                        publishView.SetStyle('publish-has-emoji');
                        if (global$k.isAndroid()) {
                            publishView.SetStyle('publish-has-emoji-android');
                        }
                    }
                },
                setDarkModel() {
                    var config = this.colorConfig;
                    var isDark = global$k.getDarkColorModel(config);
                    var channelNameView = this.view.GetUIObject('channelName');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var publishView = this.view.GetUIObject('publish');
                    var spaceView = this.view.GetUIObject('headerSpace');
                    var targetTexture = spaceView.GetTexture('forumSpace');

                    ArkWindow.console.error('viewId', this.view.GetID());

                    this.refs.channelNameView = channelNameView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.publishView = publishView;
                    this.refs.newspaceView = spaceView;
                    this.refs.targetTexture = targetTexture;

                    if (isDark) {
                        ArkWindow.console.error('isDark' + isDark);
                        channelNameView.SetTextColor(0xFFE8E9EA);
                        guildNameView.SetTextColor(0xFFE8E9EA);
                        publishView.SetTextColor(0xFF838387);
                        targetTexture.SetValue(0xFF151516);
                        return
                    }
                    channelNameView.SetTextColor(0xFF222222);
                    guildNameView.SetTextColor(0xFF222222);
                    publishView.SetTextColor(0xFFA2A5AC);
                    targetTexture.SetValue(0xFFD9D9DC);
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.setDarkModel();
                },
                setViewValue() {
                    var channelNameView = this.view.GetUIObject('channelName');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var publishView = this.view.GetUIObject('publish');
                    var avatarView = this.view.GetUIObject('avatar');
                    var spaceView = this.view.GetUIObject('headerRightSpace');

                    this.refs.channelNameView = channelNameView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.publishView = publishView;
                    this.refs.avatarView = avatarView;
                    this.refs.spaceView = spaceView;

                    var channelInfo = this.metaData.data.channel_info;
                    var poster = this.metaData.data.poster;
                    var createTime = this.metaData.data.feed.create_time;

                    var channelName = channelInfo.channel_name;
                    var guildName = channelInfo.guild_name;
                    var guildId = channelInfo.str_guild_id;
                    var nick = poster.nick;
                    var avatar = channelInfo.guild_icon || global$k.getAvatar(guildId);
                    var publishTimeStr = this.getCreateTimeStr(createTime);

                    var publishStr = nick + ' ' + publishTimeStr + '发布';

                    channelNameView.SetValue(channelName);
                    guildNameView.SetValue(guildName);
                    avatarView.SetValue(avatar);
                    publishView.SetValue(publishStr);

                    if (!guildName) {
                        spaceView.SetVisible(false);
                    }
                },
                getCreateTimeStr(time) {
                    if (!time) {
                        time = parseInt(Date.now() / 1000);
                    }
                    if (this.isSameDay(time * 1000)) {
                        return '今天';
                    }
                    if (this.isLastDay(time * 1000)) {
                        return '昨天';
                    }

                    var date = new Date(time * 1000);
                    var month = date.getMonth() + 1;
                    var day = date.getDate();
                    var year = date.getFullYear();
                    var monthStr = month >= 10 ? month : '0' + month;
                    var dayStr = day >= 10 ? day : '0' + day;
                    if (this.isSameYear(time * 1000)) {
                        return monthStr + '-' + dayStr;
                    }
                    return year + '-' + monthStr + '-' + dayStr;
                },
                isSameDay(createTime) {
                    var date = new Date();
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    var timeStamp = new Date(year + '/' + month + '/' + day).getTime();
                    var distanceTime = createTime - timeStamp;
                    return distanceTime < 24 * 60 * 60 * 1000 && distanceTime > 0;
                },
                isLastDay(createTime) {
                    var date = new Date();
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    var timeStamp = new Date(year + '/' + month + '/' + day).getTime();
                    var distanceTime = timeStamp - createTime;
                    return distanceTime < 24 * 60 * 60 * 1000 && distanceTime > 0;
                },
                isSameYear(createTime) {
                    var createYear = new Date().getFullYear();
                    var year = new Date(createTime).getFullYear();
                    return year === createYear;
                }
            }
        };
    })();

    var global$j = ArkWindow;
    (function() {
        var appView = "link";
        global$j[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "link");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue", value);
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.renderLinkView();
                },
                renderLinkView() {
                    var data = this.metaData.data.textStr;
                    var isHref = this.metaData.data.img;
                    var margin = this.metaData.data.margin;
                    if (margin) {
                        this.view.SetStyle('link-wrap-margin');
                    }
                    var imageView = this.view.GetUIObject('linkImage');
                    var textView = this.view.GetUIObject('linkText');
                    this.refs.textView = textView;
                    this.refs.imageView = imageView;
                    textView.SetValue(data);
                    if (!isHref) {
                        imageView.SetStyle('link-image-none');
                    }
                }
            }
        };
    })();

    var global$i = ArkWindow;
    (function() {
        var appView = "group";
        global$i[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "group");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue", value);
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.rendergroupView();
                },
                rendergroupView() {
                    var data = this.metaData.data.textStr;
                    var margin = this.metaData.data.margin;
                    var groupCode = this.metaData.data.groupCode;
                    if (margin) {
                        this.view.SetStyle('group-wrap-margin');
                    }
                    var imageView = this.view.GetUIObject('groupImage');
                    var textView = this.view.GetUIObject('groupText');
                    var groupAvatar = 'https://p.qlogo.cn/gh/' + groupCode + '/' + groupCode + '/100';
                    ArkWindow.console.log("groupAvatar");
                    ArkWindow.console.log(groupAvatar);
                    this.refs.textView = textView;
                    this.refs.imageView = imageView;
                    textView.SetValue(data);
                    imageView.SetValue(groupAvatar);
                }
            }
        };
    })();

    var global$h = ArkWindow;
    (function() {
        var appView = "guild";
        global$h[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "guild");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue", value);
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.renderguildView();
                },
                renderguildView() {
                    var textStr = this.metaData.data.textStr;
                    var channelType = this.metaData.data.channelType;
                    var margin = this.metaData.data.margin;
                    if (margin) {
                        this.view.SetStyle('guild-wrap-margin');
                    }
                    var imageView = this.view.GetUIObject('guildImage');
                    var textView = this.view.GetUIObject('guildText');
                    this.refs.textView = textView;
                    this.refs.imageView = imageView;
                    this.refs.imageView.SetValue(this.getGuildIconByChannelType(channelType));
                    textView.SetValue(textStr);
                },
                getGuildIconByChannelType(channelType) {
                    /*
                        global.ARK_SHARE_TYPE = {
                            INVALID: 0,  // 无效类型
                            ARK_TEXT: 1,     // 文字频道
                            ARK_VOICE: 2,    // 语音频道
                            ARK_HOMEPAGE: 3, // 主页频道
                            ARK_HIDDEN: 4,   // 隐藏频道
                            ARK_LIVE: 5,   // 直播频道
                            ARK_APPLICATION: 6, // 应用频道
                            ARK_FORUM: 7,  // 论坛频道
                            ARK_META: 8, // 元宇宙子频道
                            ARK_GUILD: 10, // 这里从10开始，避免之后有新增的子频道类型
                            ARK_SCHEDULE: 11, // 日程频道
                            ARK_YOULE_GAME: 12, // 有乐小游戏应用子频道
                            ARK_FEED_SQUARE: 13 //帖子广场
                        };
                     */
                    const defaultIcon = 'images/application-channel.png';
                    const iconMap = {
                        [global$h.ARK_SHARE_TYPE.ARK_TEXT]: 'images/text-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_VOICE]: 'images/audio-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_HOMEPAGE]: defaultIcon,
                        [global$h.ARK_SHARE_TYPE.ARK_HIDDEN]: defaultIcon,
                        [global$h.ARK_SHARE_TYPE.ARK_LIVE]: 'images/live-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_APPLICATION]: 'images/application-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_FORUM]: 'images/feed-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_META]: defaultIcon,
                        [global$h.ARK_SHARE_TYPE.ARK_GUILD]: defaultIcon,
                        [global$h.ARK_SHARE_TYPE.ARK_SCHEDULE]: 'images/application-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_YOULE_GAME]: 'images/application-channel.png',
                        [global$h.ARK_SHARE_TYPE.ARK_FEED_SQUARE]: 'images/square-channel.png'

                    };
                    return iconMap[channelType] || defaultIcon;
                }
            }
        };
    })();

    var global$g = ArkWindow;
    (function() {
        var appView = "record";
        global$g[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "record");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.config = ArkWindow.app.config;
                    this.renderLinkView();
                },
                renderLinkView() {
                    var me = this;
                    var recordData = this.metaData.data;
                    var commentCount = recordData.commentCount;
                    var preferCount = recordData.preferCount;
                    var viewCount = recordData.viewCount;
                    var emojiCount = recordData.emojiCount;
                    var viewCountFirst = !(viewCount === '' || viewCount === undefined);
                    me.temViews = [];

                    var messageTextView = this.view.GetUIObject('messageText');
                    var recordImageView = this.view.GetUIObject('recordImage');
                    var textView = me.view.GetUIObject('recordImagesWrap');
                    this.refs.messageTextView = messageTextView;
                    this.refs.recordImageView = recordImageView;
                    this.refs.textView = textView;

                    // 兼容老版没有viewCount字段
                    if (!viewCountFirst) {
                        var emojiPics = recordData.emojiPics;
                        // 隐藏赞跟浏览字段
                        this.refs.messageTextView.SetStyle('record-message-wrap-AttributeName-none');

                        // 展示评论跟表情表态
                        this.refs.recordImageView.SetStyle('record-image');
                        this.refs.textView.SetStyle('record-images-wrap');

                        emojiPics.forEach(function(image) {

                            me.temViews.push(textView);
                            var id = image.emoji_id;
                            var type = image.emoji_type;
                            var src = global$g.getEmojiUrl(type, id);
                            var imageView = UI.Image();
                            me.temViews.push(imageView);
                            imageView.SetStyle('record-content-image');
                            imageView.SetValue(src);
                            imageView.SetStretch(2);
                            imageView.SetRadius(3, 3, 3, 3);

                            // gif 需要重试一试
                            if (src.slice(-3) === 'gif') {
                                me.attach(imageView, id, 0);
                            }
                            textView.AddChild(imageView);
                        }, this);
                    } else {
                        // 隐藏评论跟表情表态
                        this.refs.textView.SetStyle('record-images-wrap-none');
                        this.refs.recordImageView.SetStyle('record-image-none');

                        // 展示赞跟浏览字段
                        this.refs.messageTextView.SetStyle('record-message-wrap-AttributeName');

                        // linux 大字号渲染宽度偏小，增加2px兼容
                        const messageTextViewTextSize = this.refs.messageTextView.MeasureTextSize();
                        this.refs.messageTextView.SetStyle(`display:flex;width:${messageTextViewTextSize.width + 2};height:auto;marginRight:4`);
                    }


                    var messageCountView = this.view.GetUIObject('messageCount');
                    var emojiCountView = this.view.GetUIObject('emojiCount');

                    this.refs.messageCountView = messageCountView;
                    this.refs.emojiCountView = emojiCountView;

                    if (viewCountFirst) {
                        messageCountView.SetValue(this.transViewCountText(viewCount));
                    } else {
                        messageCountView.SetValue(commentCount);
                    }
                    if (viewCountFirst) {
                        emojiCountView.SetValue('赞  ' + this.transViewCountText(preferCount));
                    } else {
                        emojiCountView.SetValue(emojiCount);
                    }

                    this.setColorModel();

                },
                transViewCountText(viewCount) {
                    if (!viewCount) {
                        return '0';
                    }
                    let viewCountText = viewCount;
                    const viewCountNum = Number(viewCount);
                    if (viewCountNum > 9999 && viewCountNum <= 99999) {
                        viewCountText = (viewCountNum / 10000).toString().substring(0, 3) + '万+';
                    } else if (viewCountNum > 99999) {
                        viewCountText = '10万+';
                    }
                    return viewCountText
                },
                OnConfigChange(config) {
                    this.config = config;
                    this.setColorModel();
                },

                setColorModel() {
                    var config = this.config;
                    var isDark = global$g.getDarkColorModel(config);

                    var messageCountView = this.view.GetUIObject('messageCount');
                    var messageTextView = this.view.GetUIObject('messageText');
                    var emojiCountView = this.view.GetUIObject('emojiCount');

                    this.refs.messageCount = messageCountView;
                    this.refs.emojiCountView = emojiCountView;
                    this.refs.messageTextView = messageTextView;

                    if (isDark) {
                        messageCountView.SetTextColor(0xFF838387);
                        emojiCountView.SetTextColor(0xFF838387);
                        messageTextView.SetTextColor(0xFF838387);
                        return;
                    } else {
                        messageCountView.SetTextColor(0xFFA2A5AC);
                        emojiCountView.SetTextColor(0xFFA2A5AC);
                        messageTextView.SetTextColor(0xFFA2A5AC);
                    }
                },

                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        image.GetValue();
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                            return;
                        }
                        var lastUrl = 'https://framework.cdn-go.cn/qqmoji/latest/sysface/static/s' + id + '.png';
                        image.SetValue(lastUrl);
                    });
                }
            }
        };
    })();

    var global$f = ArkWindow;
    (function() {
        var appView = "comment";
        global$f[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "comment");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    if (global$f.isAndroid()) {
                        var spaceView = this.view.GetUIObject('spaceView');
                        this.refs.spaceView = spaceView;
                        spaceView.SetStyle('comment-content-space-android');
                    }
                    this.views = [];
                    this.view.hasUpdate = true;
                    this.config = ArkWindow.app.config;
                    this.setColorModel();
                    this.renderView();
                },
                OnConfigChange(config) {
                    this.config = config;
                    this.UpdateRender();
                    this.setColorModel();
                },
                setColorModel() {
                    var config = this.config;
                    var isDark = global$f.getDarkColorModel(config);

                    var spaceView = this.view.GetUIObject('spaceView');
                    this.refs.spaceView = spaceView;
                    ArkWindow.console.error('viewId', this.view.GetID());
                    var targetTexture = spaceView.GetTexture('space');
                    this.refs.space = targetTexture;
                    if (isDark) {
                        targetTexture.SetValue(0xFF151516);
                        return
                    }
                    targetTexture.SetValue(0xFFD9D9DC);

                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$f[template] && global$f[template].ViewModel && global$f[template].ViewModel.New) {
                        var model = global$f[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                renderView() {
                    var data = this.metaData.data;
                    if (!data) {
                        return;
                    }
                    var me = this;
                    var len = data.length - 1;
                    data.forEach(function(comment, index) {
                        var commentItemView = me.generateView('commentItem', {
                            data: {
                                comment: comment,
                                margin: index === len
                            }
                        });
                        var view = me.view;
                        view.AddChild(commentItemView);
                        me.views.push(commentItemView);
                    });
                },
                UpdateRender() {
                    if (!this.views) {
                        return;
                    }
                    ArkWindow.console.time('comment UpdateRender start');
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                    ArkWindow.console.time('comment UpdateRender end');
                }
            }
        };
    })();

    var global$e = ArkWindow;
    (function() {
        var appView = "empty";
        global$e[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "link");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.colorConfig = ArkWindow.app.config;
                    this.renderView();
                },
                renderView() {
                    var channelNameView = this.view.GetUIObject('channelName');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var avatarView = this.view.GetUIObject('avatar');
                    var spaceView = this.view.GetUIObject('headerRightSpace');

                    this.refs.channelNameView = channelNameView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.spaceView = spaceView;
                    this.refs.avatarView = avatarView;

                    var channelInfo = this.metaData.data.channel_info;

                    var channelName = channelInfo.channel_name;
                    var guildName = channelInfo.guild_name;
                    var guildId = channelInfo.str_guild_id;

                    var avatar = channelInfo.guild_icon || global$e.getAvatar(guildId);

                    channelNameView.SetValue(channelName);
                    guildNameView.SetValue(guildName);
                    avatarView.SetValue(avatar);

                    if (!guildName) {
                        spaceView.SetVisible(false);
                    }
                    this.setDarkModel();
                },
                setDarkModel() {
                    var channelNameView = this.view.GetUIObject('channelName');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var spaceView = this.view.GetUIObject('headerRightSpace');
                    ArkWindow.console.error('viewId', this.view.GetID());
                    var targetTexture = spaceView.GetTexture('spaceColor');
                    var emptyTitle = this.view.GetUIObject('emptyTitle');
                    var emptySubTitle = this.view.GetUIObject('emptySubTitle');

                    this.refs.channelNameView = channelNameView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.spaceView = spaceView;
                    this.refs.emptyTitle = emptyTitle;
                    this.refs.emptySubTitle = emptySubTitle;
                    this.refs.targetTexture = targetTexture;

                    var config = this.colorConfig;
                    var isDark = global$e.getDarkColorModel(config);

                    var titleColor = 0xFF222222;
                    var subTitleColor = 0xFF999999;
                    var textColor = 0xFFB2B2B2;
                    var textureColor = 0xFFB2B2B2;

                    if (isDark) {

                        textColor = 0xFFE8E9EA;
                        textureColor = 0xFF151516;
                        titleColor = 0xFFE8E9EA;
                        subTitleColor = 0xFF999999;
                    }

                    ArkWindow.console.time('isDark' + isDark);

                    channelNameView.SetTextColor(textColor);
                    guildNameView.SetTextColor(textColor);
                    targetTexture.SetValue(textureColor);
                    emptyTitle.SetTextColor(titleColor);
                    emptySubTitle.SetTextColor(subTitleColor);
                },

                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.setDarkModel();
                },
            }
        };
    })();

    var global$d = ArkWindow;
    (function() {
        var appView = "commentItem";
        global$d[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "commentItem");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    if (global$d.isAndroid()) {
                        this.view.SetStyle('comment-item-wrap-android');
                    }

                    this.view.hasUpdate = true;
                    this.views = [];
                    this.colorConfig = ArkWindow.app.config;
                    this.renderView();
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$d[template] && global$d[template].ViewModel && global$d[template].ViewModel.New) {
                        var model = global$d[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                renderView() {
                    var nick = this.metaData.data.comment.post_user.nick + ':';
                    var desc = this.metaData.data.comment.rich_contents;
                    var margin = this.metaData.data.margin;
                    var nickView = this.view.GetUIObject('commentItemNick');
                    var descView = this.view.GetUIObject('commentItemRight');
                    this.refs.nickView = nickView;
                    this.refs.descView = descView;
                    var nickColor = 0xFFA2A5AC;
                    var config = this.colorConfig || ArkWindow.app.config;
                    var dark = global$d.getDarkColorModel(config);

                    if (dark) {
                        nickColor = 0xFF838387;
                    }
                    nickView.SetTextColor(nickColor);
                    nickView.SetValue(nick);

                    var emojiView = this.generateView('emoji', {
                        data: {
                            maxLine: 1,
                            text: desc,
                            font: 'size.13'
                        }
                    });
                    descView.AddChild(emojiView);
                    if (margin) {
                        this.view.SetStyle("comment-item-wrap-no-margin");
                    }
                    this.views.push(emojiView);
                },
                UpdateRender() {
                    if (!this.views) {
                        ArkWindow.console.time('no views comment');
                        return;
                    }
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                }
            }
        };
    })();

    var global$c = ArkWindow;
    (function() {
        var appView = "image";
        global$c[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "image");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.refs = {};
                    this.refsViews = [];
                    this.hasUpdate = true;
                },
                UpdateRender() {

                    ArkWindow.console.timeLog('images UpdateRender');
                    var images = this.metaData.data;
                    var len = images.length;
                    var extraLen = len - 3;
                    if (images.length && images.length >= 3) {
                        images = images.slice(0, 3);
                    }
                    len = images.length;

                    this.view.ClearChildren();

                    if (!len) {
                        this.view.SetVisible(false);
                    }

                    if (len === 1) {
                        this.setSingleImage(images[0]);
                    }
                    if (len === 2) {
                        this.setDoubleImage(images);
                    }
                    if (len === 3) {
                        this.setThirdImage(images, extraLen);
                    }
                },
                showUpdate(images) {
                    if (!this.oldData) {
                        return true;
                    }

                    var len = images.length;
                    var oldLen = this.oldData.length;
                    if (len !== oldLen) {
                        return true;
                    }
                    return JSON.stringify(images) === JSON.stringify(this.oldData);
                },

                resetHeight() {
                    var me = this;
                    var root = me.view.GetRoot();
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model);
                },
                setSingleImage(image) {
                    var me = this;
                    var url = image.pic_url;
                    var requestTime = 3;
                    var wrap = this.view;
                    wrap.SetStyle('pro-feed-image');
                    wrap.Update();
                    var imgWrap = UI.View();
                    me.refs.imageWrap = imgWrap;
                    var rootSize = wrap.GetSize();
                    var orgWidth = rootSize.width;

                    var width = image.width;
                    var height = image.height;
                    var radio = (width / height) || (1188 / 501);

                    if (!width || !height) {
                        radio = 1;
                    }

                    var imgWrapWidth = orgWidth * 0.8;
                    var imgWrapHeight = orgWidth * 0.48;

                    if (radio >= 1) {
                        imgWrapWidth = orgWidth * 0.8;
                        imgWrapHeight = orgWidth * 0.48;
                    }

                    if (radio < 1) {
                        imgWrapWidth = orgWidth * 0.4;
                        imgWrapHeight = orgWidth * 0.52;
                    }

                    var rootWidth = imgWrapWidth;
                    var rootHeight = imgWrapHeight;
                    var rootRadio = rootWidth / rootHeight;
                    var texture = UI.Image();
                    me.refs.qunFeedImageTexture = texture;
                    if (rootRadio > radio) {
                        var width = rootWidth;
                        var height = rootWidth / radio;
                        var top = (height - rootHeight) / 2;
                        texture.SetSize(width, height);

                        ArkWindow.console.timeLog("imageStyle: width:" + width + ";height:" + height);

                        texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + width + ";height:" + height);
                    } else {
                        var width = rootHeight * radio;
                        var height = rootHeight;
                        var left = -1 * (width - rootWidth) / 2;
                        texture.SetSize(width, rootHeight);

                        ArkWindow.console.timeLog("imageStyle: width:" + width + ";height:" + height);

                        texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + width + ";height:" + height);
                    }
                    me.wrapHeight = imgWrapHeight;
                    imgWrap.SetStyle('display: flex;height:' + imgWrapHeight + ';width: ' + imgWrapWidth + ';position: relative');
                    imgWrap.SetRadius(6, 6, 6, 6);
                    imgWrap.AddChild(texture);

                    if (image.isVideo) {
                        var icon = me.createVideoIcon(rootWidth, rootHeight);
                        imgWrap.AddChild(icon);
                    }
                    imgWrap.Update();
                    me.view.AddChild(imgWrap);
                    me.view.Update();

                    this.cacheImage(url, requestTime, function(data) {
                        ArkWindow.console.warn('singleImage', data);
                        if (!data || !data.path) {
                            ArkWindow.console.warn('no imageData', url);
                            return;
                        }
                        if (texture) {
                            ArkWindow.console.error('texture', !!texture);
                            texture.SetValue(data.path);
                        }
                    });
                },
                setDoubleImage(images) {
                    var me = this;
                    var size = this.view.GetSize();
                    var width = size.width * 32.5 / 100;
                    var margin = size.width * 1.25 / 100;

                    me.wrapHeight = width;
                    me.temViewsArray = [];
                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;
                        if (index == 0) {
                            imageView.SetRadius(6, 0, 0, 6);
                        } else {
                            imageView.SetRadius(0, 6, 6, 0);
                        }
                        var styleStr = 'display:flex;position:relative;width:' + width + ';height:' + width + ';marginRight:' + margin;
                        imageView.SetStyle(styleStr);

                        if (!image) {
                            return;
                        }
                        var imgWidth = image.width;
                        var imgHeight = image.height;
                        var radio = (imgWidth / imgHeight);

                        if (!imgWidth || !imgHeight) {
                            radio = 1;
                        }

                        var rootWidth = width;
                        var rootHeight = width;
                        var rootRadio = rootWidth / rootHeight;
                        var texture = UI.Image();
                        me.temViewsArray.push(texture);
                        if (rootRadio > radio) {
                            var dataWidth = rootWidth;
                            var dataHeight = rootWidth / radio;
                            var top = (dataHeight - rootHeight) / 2;
                            ArkWindow.console.warn(dataWidth, dataHeight);

                            ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                            texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + dataWidth + ";height:" + dataHeight);
                        } else {
                            var dataWidth = rootHeight * radio;
                            var dataHeight = rootHeight;
                            var left = -1 * (dataWidth - rootWidth) / 2;
                            texture.SetSize(dataWidth, rootHeight);

                            ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                            texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + dataWidth + ";height:" + dataHeight);
                        }
                        var icon;
                        if (image.isVideo) {
                            icon = me.createVideoIcon(rootWidth, rootHeight);
                        }
                        me.view.AddChild(imageView);
                        imageView.AddChild(texture);

                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.warn('no imageData', url);
                                return;
                            }
                            var path = data.path;
                            if (icon) {
                                imageView.AddChild(icon);
                            }
                            ArkWindow.console.error('texture', !!texture);
                            if (texture) {
                                texture.SetValue(path);
                            }
                        });
                    });
                },
                setThirdImage(images, extraLen) {
                    var me = this;
                    var size = this.view.GetSize();
                    var width = size.width * 32.5 / 100;
                    size.width * 1.25 / 100;

                    me.wrapHeight = width;
                    me.view.SetStyle('image-wrap-three');
                    me.texturesRefs = [];
                    me.viewImgRefs = [];
                    me.temViewsArray = [];
                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;
                        if (index == 0) {
                            imageView.SetRadius(6, 0, 0, 6);
                        }
                        if (index == 1) {
                            imageView.SetRadius(0, 0, 0, 0);
                        }
                        if (index == 2) {
                            imageView.SetRadius(0, 6, 6, 0);
                        }
                        var styleStr = 'display:flex;position:relative;width:' + Math.ceil(width) + ';height:' + Math.ceil(width);
                        imageView.SetStyle(styleStr);
                        me.view.AddChild(imageView);
                        me.view.Update();

                        me.view.SetSize(size.width, Math.ceil(width));
                        if (!image) {
                            return;
                        }
                        var imgWidth = image.width;
                        var imgHeight = image.height;
                        var radio = (imgWidth / imgHeight);
                        var rootWidth = width;
                        var rootHeight = width;
                        var rootRadio = rootWidth / rootHeight;

                        if (!imgWidth || !imgHeight) {
                            radio = 1;
                        }

                        var texture = UI.Image();
                        me.temViewsArray.push(texture);
                        me.refs.qunFeedImageTexture = texture;
                        if (rootRadio > radio) {
                            var dataWidth = rootWidth;
                            var dataHeight = rootWidth / radio;
                            var top = (dataHeight - rootHeight) / 2;
                            texture.SetSize(dataWidth, rootHeight);

                            ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                            texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + dataWidth + ";height:" + dataHeight);
                        } else {

                            var dataWidth = rootHeight * radio;
                            var dataHeight = rootHeight;
                            var left = -1 * (dataWidth - rootWidth) / 2;

                            texture.SetSize(dataWidth, rootHeight);

                            ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                            texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + dataWidth + ";height:" + dataHeight);
                        }
                        var icon;
                        if (image.isVideo) {
                            icon = me.createVideoIcon(rootWidth, rootHeight);
                        }

                        imageView.AddChild(texture);
                        imageView.Update();

                        // imageView需在挂载后添加
                        if (index == 2 && extraLen > 0) {
                            var extraLenView = me.createExtraView(extraLen, Math.ceil(width), Math.ceil(width));
                            if (extraLenView && imageView) {
                                imageView.AddChild(extraLenView);
                            }
                        }

                        me.texturesRefs.push(texture);
                        me.viewImgRefs.push(imageView);

                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.timeLog('no imageData', url);
                                return;
                            }
                            var texture = me.texturesRefs[index];
                            var imageView = me.viewImgRefs[index];
                            var path = data.path;
                            if (icon && imageView) {
                                imageView.AddChild(icon);
                            }
                            ArkWindow.console.error('texture', !!texture);
                            if (texture) {
                                texture.SetValue(path);
                            } else {
                                ArkWindow.console.error(me.texturesRefs[index], index, me.texturesRefs);
                            }
                        });
                    });
                },
                createExtraView(extraLen, imgWidth, imgHeight) {
                    var view = this.generateView('extraLen', {
                        data: {
                            extraLen: extraLen,
                            parentWidth: imgWidth,
                            parentHeight: imgHeight
                        }
                    });
                    return view;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$c[template] && global$c[template].ViewModel && global$c[template].ViewModel.New) {
                        var model = global$c[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                createVideoIcon(width, height) {
                    var view = UI.View();
                    var image = UI.Image();
                    this.refsViews.push(view);
                    this.refsViews.push(image);
                    view.SetStyle('video-icon-wrap');
                    image.SetStyle('video-icon');
                    image.SetValue('images/btn_play.png');
                    this.clipImage(view, width, height);
                    view.AddChild(image);
                    return view;
                },
                clipImage: function(view, rootWidth, rootHeight) {
                    var me = this;
                    var radio = 1;
                    var rootRadio = rootWidth / rootHeight;
                    var texture = UI.Image();
                    me.refsViews.push(texture);
                    me.refs.qunFeedImageMask = texture;
                    if (rootRadio > radio) {
                        var dataWidth = rootWidth;
                        var dataHeight = rootWidth / radio;
                        var top = (dataHeight - rootHeight) / 2;

                        ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                        texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + dataWidth + ";height:" + dataHeight);
                    } else {
                        var dataWidth = rootHeight * radio;
                        var dataHeight = rootHeight;
                        var left = -1 * (dataWidth - rootWidth) / 2;
                        texture.SetSize(dataWidth, rootHeight);

                        ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                        texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + dataWidth + ";height:" + dataHeight);
                    }
                    ArkWindow.console.error('images/mask.png', !!texture);
                    if (texture) {
                        texture.SetValue('images/mask.png');
                    }
                    view.AddChild(texture);
                },
                cacheImage(imageUrl, requestTime, callback) {
                    var data = arkWeb.Storage.Load(imageUrl);
                    var me = this;
                    if (data && data.width && data.height) {
                        ArkWindow.console.warn('cachedImage', imageUrl);
                        return callback(data);
                    }

                    ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                        if (err) {
                            ArkWindow.console.warn(imageUrl + ' OnError', err);
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        }

                        var img = UI.Image();
                        me.refsViews.push(img);
                        img.AttachEvent("OnError", function(sender) {
                            ArkWindow.console.warn(imageUrl, ' OnError');
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        });

                        img.AttachEvent("OnLoad", function(sender) {
                            ArkWindow.console.log(imageUrl + ' OnLoad');

                            var size = sender.GetSize();
                            ArkWindow.console.log('width: ' + size.width + ' height: ' + size.height);

                            arkWeb.Storage.Save(imageUrl, {
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                            callback({
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                        });

                        img.SetValue(path);
                    });
                },

            }
        };
    })();

    var global$b = ArkWindow;
    (function() {
        var appView = "qunpro95";
        global$b[appView] = {
            appView: appView,
            ViewModel: {
                "key": "qunpro",
                New: function(view) {
                    ArkWindow.console.log(appView + " New");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.viewWrap = view;

                    this.contentWrapView = view;
                    this.view = view.GetUIObject('forumWrap');
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.initConstants();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();

                },
                Deinitialize: function() {
                    ArkWindow.console.warn(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.warn(appView + " OnResize");
                    // this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.consoleTime('qunPro OnSetValue');
                    this.Update();
                },
                consoleTime(key) {
                    var feed = this.metaData.detail.feed;
                    var title = '';
                    if (feed && feed.title && feed.title.contents && feed.title.contents.length && feed.title.contents[0].text_content && feed.title.contents[0].text_content.text) {
                        title = feed.title.contents[0].text_content.text;
                    }
                    var startTime = this.consoleStartTime;
                    if (!startTime) {
                        this.consoleStartTime = Date.now();
                        startTime = this.consoleStartTime;
                    }
                    var endTime = Date.now() - startTime;
                    ArkWindow.console.time('qunpro-->' + title + ': ' + key, endTime);
                },
                Update: function() {
                    if (!this.metaData.detail) {
                        return;
                    }

                    if (global$b.isAndroid()) {
                        this.view.SetStyle('forum-wrap-android-95');
                    }
                    this.view.hasUpdate = true;

                    // 默认设置为true
                    this.views = [];
                    this.clearViewModesMap = [];
                    this.refs = {};
                    this.active = true;
                    this.duration = this.metaData.detail.duration || 10;
                    this.securityBeat = this.metaData.detail.security_beat;
                    this.getBaseDuration();
                    var detail = this.metaData.detail;
                    this.config = ArkWindow.app.config;
                    this.setDarkModel();
                    // 有数据直接渲染
                    var hasFeed = this.hasAllFeed();

                    this.consoleTime('hasFeed ' + hasFeed);
                    if (hasFeed) {
                        this.updateAllView(detail, true);
                        ArkWindow.console.warn('timeout');
                        // 更新
                        this.request();
                        return;
                    }

                    var key = this.metaData.detail.feed_id;
                    var data = this.getCacheFromKey(key);

                    this.consoleTime('hasDataCache: ' + (!!data));

                    if (data) {
                        this.metaData.detail.feed = data.content;
                        this.updateAllView(detail, true);
                        this.request();
                        return;
                    }

                    this.view.SetStyle('forum-wrap-no-padding-95');
                    this.request();
                    // 无数据直接拉数据然后渲染
                },
                initConstants() {
                    this.viewColorConf = {
                        normalBg: {
                            light: 0xFFFFFFFF,
                            dark: 0xFF262626
                        },
                        clickBg: {
                            light: 0xFFF0F0F0,
                            dark: 0xFF232323
                        },
                    };
                },
                clearCache() {
                    var key = this.metaData.detail.feed_id;
                    this.consoleTime('clearCache start', key);
                    arkWeb.Storage.Save(key, {
                        time: Date.now(),
                        content: ''
                    });
                    this.consoleTime('clearCache end', key);
                },
                cache(feed) {
                    var key = this.metaData.detail.feed_id;
                    var dataStr = JSON.stringify(feed);

                    this.consoleTime('writeCache start');
                    arkWeb.Storage.Save(key, {
                        time: Date.now(),
                        content: dataStr
                    });
                    this.consoleTime('writeCache end');
                },
                getCacheFromKey(key) {
                    this.consoleTime('getCache start');
                    var data = arkWeb.Storage.Load(key);
                    this.consoleTime('getCache end');
                    if (data && data.content) {
                        return {
                            content: JSON.parse(data.content),
                            time: data.time,
                        }
                    }
                    return null;
                },
                hasAllFeed() {
                    var feed = this.metaData.detail.feed;
                    return !!(feed.contents || feed.title);
                },
                setDarkModel() {
                    var config = this.config;
                    var isDark = global$b.getDarkColorModel(config);
                    var texture = this.viewWrap.GetTexture('bgColor1');
                    this.refs.texture = texture;
                    var color = 0xFFFFFFFF;
                    if (isDark) {
                        color = 0xFF2D2D35;
                    }
                    ArkWindow.console.error('base texture', !!texture);
                    if (texture) {
                        texture.SetValue(color);
                    }
                },
                OnConfigChange(config) {
                    this.config = config;
                    this.setDarkModel();
                },
                updateAllView(data, first) {
                    this.consoleTime('qunpro Start Updaterender');

                    this.shouldCacheFeed = false;
                    this.shouldCacheImage = false;
                    this.shouldCacheRecord = false;
                    this.shouldCacheComment = false;
                    // 第一次不计算
                    if (!first) {
                        this.shouldCacheFeed = this.shouldCacheFeedView(data);
                        this.shouldCacheImage = this.shouldCacheImageView(data);
                        this.shouldCacheRecord = this.shouldCacheRecordView(data);
                        this.shouldCacheComment = this.shouldCacheCommentView(data);
                    }

                    if (first) {
                        var imgData = this.getImage(data);
                        var recordData = this.getRecordFeedData(data);
                        var comments = this.getFeedCommentData(data);
                        this.commentCacheData = comments;
                        this.imgData = imgData;
                        this.recordCacheData = recordData;
                        this.feedCacheData = data.pattern_info;
                    }

                    // 第一次不输出
                    if (!first) {
                        this.consoleTime('shouldCacheHeader  ' + this.shouldCacheHeader + ' shouldCacheFeed  ' + this.shouldCacheFeed + ' shouldCacheImage  ' + this.shouldCacheImage + ' shouldCacheRecord  ' + this.shouldCacheRecord + ' shouldCacheComment ' + this.shouldCacheComment);
                        if (this.shouldCacheHeader && this.shouldCacheFeed && this.shouldCacheImage && this.shouldCacheRecord && this.shouldCacheComment) {
                            this.consoleTime('no action');
                            return;
                        }
                    }

                    // 先删除
                    this.viewWrap.DeleteChild(this.view);

                    // 回收model
                    this.clearView();

                    // 处理header
                    if (this.shouldCacheHeader) {
                        this.view.AddChild(this.headerViewCache);
                    } else {
                        this.generateHeader(data);
                        this.shouldCacheHeader = true;
                    }

                    // 先处理图片
                    if (this.shouldCacheImage && this.imageViewCache) {
                        this.view.AddChild(this.imageViewCache);
                    } else {
                        this.generateImage(data);
                    }
                    // 处理帖子
                    if (this.shouldCacheFeed && this.feedViewCache) {
                        this.view.AddChild(this.feedViewCache);
                    } else {
                        this.generateFeed(data);
                    }


                    // 处理表情记录
                    if (this.shouldCacheRecord && this.recordViewCache) {
                        this.view.AddChild(this.recordViewCache);
                    } else {
                        this.generateRecord(data);
                    }

                    // 处理评论
                    if (this.shouldCacheComment && this.commentViewCache) {
                        this.view.AddChild(this.commentViewCache);
                    } else {
                        this.generateComment(data);
                    }
                    // 删除离屏幕再加回来。
                    this.viewWrap.AddChild(this.view);

                    this.view.Update();
                    var root = this.view.GetRoot();
                    this.consoleTime('start UpdateRender');
                    this.consoleTime('first: ' + first);

                    if (first) {
                        var size = this.getAllHeight();
                        this.consoleTime('resetSize first:' + size);
                        this.hasUpdate = true;
                        return true;
                    }

                    ArkWindow.app.UpdateRender(root);
                    var size = this.getAllHeight();
                    this.consoleTime('resetSize:' + size);
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model, true);
                    if (model) {
                        model.shouldReset = true;
                    }
                    this.hasUpdate = true;
                },

                getAllHeight() {
                    var views = this.views;
                    var size = 0;
                    views.forEach(function(view) {
                        // me.consoleTime(view.GetID());
                        // me.consoleTime(JSON.stringify(view.GetSize()));
                        size = size + view.GetSize().height;
                    });
                    return size;
                },

                generateHeader() {
                    if (!this.metaData.detail) {
                        return;
                    }
                    this.consoleTime('qunpro render generateHeader');
                    var view = this.view;
                    var data = this.metaData.detail;
                    var headerView = this.generateHeaderView(data);
                    view.AddChild(headerView);
                    this.views.push(headerView);
                    this.headerViewCache = headerView;
                    this.consoleTime('qunpro render generateHeader end');
                },
                generateFeed(requestData) {
                    var view = this.view;
                    var data = requestData.feed;
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseDatas = global$b.parseFeed(data, guildId);
                    this.consoleTime('qunpro render parseFeed');
                    var hasImage = !!this.getImage(requestData).length;
                    var TextView = this.generateTextView(parseDatas, hasImage);
                    this.consoleTime('qunpro render generateFeed');
                    view.AddChild(TextView);
                    this.views.push(TextView);
                    this.feedViewCache = TextView;
                },
                shouldCacheFeedView(requestData) {
                    const data = requestData.feed;
                    if (!this.feedCacheData) {
                        this.feedCacheData = data.pattern_info;
                        return false;
                    }
                    const oldStr = this.feedCacheData;
                    const newStr = requestData.feed.pattern_info;
                    if (oldStr === newStr) {
                        this.feedCacheData = data.pattern_info;
                        return true;
                    }
                    this.feedCacheData = data.pattern_info;
                    return false;
                },
                generateImage(requestData) {
                    var imgData = [];
                    var view = this.view;
                    if (requestData.feed.videos && requestData.feed.videos[0] && requestData.feed.videos[0].cover && requestData.feed.videos[0].cover.pic_url) {
                        var video = requestData.feed.videos[0].cover;
                        video.isVideo = true;
                        imgData.push(video);
                    }
                    if (requestData.feed.images && requestData.feed.images.length) {
                        imgData = imgData.concat(requestData.feed.images);
                    }
                    if (!imgData.length) {
                        imgData = [];
                    }
                    this.replaceImages(imgData);

                    ArkWindow.console.error('img', imgData);

                    var imageView = this.generateView('image95', {
                        data: imgData
                    });
                    view.AddChild(imageView);
                    view.Update();
                    this.views.push(imageView);
                    this.imageViewCache = imageView;
                    this.consoleTime('qunpro render generateImage');
                },
                replaceImages(imgs) {
                    imgs.forEach(function(img) {
                        if (img && img.pic_url) {
                            img.pic_url = img.pic_url.replace('&t=7', '&t=5');
                        }
                    });
                },
                getImage(requestData) {
                    var imgData = [];
                    if (requestData.feed.videos && requestData.feed.videos[0] && requestData.feed.videos[0].cover && requestData.feed.videos[0].cover.pic_url) {
                        imgData.push(requestData.feed.videos[0].cover);
                    }
                    if (requestData.feed.images && requestData.feed.images.length) {
                        imgData = imgData.concat(requestData.feed.images);
                    }
                    if (!imgData.length) {
                        imgData = [];
                    }
                    this.replaceImages(imgData);

                    return imgData;
                },
                shouldCacheImageView(requestData) {
                    var imgData = this.getImage(requestData);
                    if (!this.imgData) {
                        this.imgData = imgData;
                        return false;
                    }
                    var oldStr = this.getDiffStr(this.imgData);

                    var newStr = this.getDiffStr(imgData);

                    if (oldStr == newStr) {
                        this.imgData = imgData;
                        return true;
                    }
                    this.imgData = imgData;
                    return false;
                },
                getDiffStr(data) {
                    var r = '';
                    data.forEach(function(image) {
                        if (!image) {
                            return;
                        }
                        var w = image.width;
                        var h = image.height;
                        var baseStr = w + '_' + h;
                        var url = new ArkWindow.UrlParser(image.pic_url);
                        if (url) {
                            baseStr = baseStr + '_' + url.path;
                        }
                        r = r + baseStr;
                    });
                    return r;
                },
                generateRecord(requestData) {
                    this.consoleTime('qunpro render generateRecord');
                    var view = this.view;
                    var defaultEmotionReaction = {
                        "emoji_reaction_list": [{
                                "emoji_id": "76",
                                "emoji_type": 1
                            },
                            {
                                "emoji_id": "311",
                                "emoji_type": 1
                            },
                            {
                                "emoji_id": "271",
                                "emoji_type": 1
                            }
                        ]
                    };
                    var emojiData = requestData.feed.emotion_reaction || defaultEmotionReaction;
                    if (!emojiData) {
                        return;
                    }
                    var commentCount = requestData.feed.comment_count || '';
                    // 浏览量
                    var viewCount = requestData.feed.view_count || '';
                    var emojiCount = requestData.feed.emotion_total_count;
                    var preferCount = requestData.feed.prefer_count;
                    var orgEmojis = emojiData.emoji_reaction_list || [];
                    var emojiPics = orgEmojis.sort(function(last, pre) {
                        return last.cnt - pre.cnt;
                    });

                    var recordData = {
                        commentCount: commentCount,
                        viewCount: viewCount,
                        emojiCount: emojiCount,
                        preferCount: preferCount,
                        emojiPics: emojiPics,
                        isChannel: this.metaData.detail.isChannel,
                        isPreview: this.metaData.detail.isPreview
                    };

                    var recordView = this.generateView('record95', {
                        data: recordData
                    });
                    view.AddChild(recordView);
                    view.Update();
                    this.views.push(recordView);
                    this.recordViewCache = recordView;
                },
                getRecordFeedData(requestData) {
                    var emojiData = requestData.feed.emotion_reaction;
                    if (!emojiData) {
                        emojiData = {
                            emoji_reaction_list: []
                        };
                    }
                    var commentCount = requestData.feed.comment_count || [];
                    // 换浏览量
                    var viewCount = requestData.feed.view_count || '';
                    var preferCount = requestData.feed.prefer_count;
                    var emojiCount = requestData.feed.emotion_total_count;
                    var orgEmojis = emojiData.emoji_reaction_list || [];
                    var emojiPics = orgEmojis.sort(function(last, pre) {
                        return last.cnt - pre.cnt;
                    });

                    var recordData = {
                        // 优先取viewCount,没有降级commentCount
                        commentCount: commentCount,
                        viewCount: viewCount,
                        emojiCount: emojiCount,
                        preferCount: preferCount,
                        emojiPics: emojiPics,
                    };
                    return recordData;
                },
                shouldCacheRecordView(requestData) {

                    var recordData = this.getRecordFeedData(requestData);

                    if (!this.recordCacheData) {
                        this.recordCacheData = recordData;
                        return false;
                    }

                    var oldStr = JSON.stringify(this.recordCacheData);

                    var newStr = JSON.stringify(recordData);

                    if (oldStr == newStr) {
                        this.recordCacheData = recordData;
                        return true;
                    }
                    this.recordCacheData = recordData;
                    return false;
                },
                generateComment(requestData) {
                    this.consoleTime('qunpro render comment');
                    var view = this.view;
                    var comments = requestData.feed.vec_comment;
                    if (!comments || !comments.length) {
                        this.consoleTime('qunpro render commentView end');
                        return;
                    }
                    var commentView = this.generateView('comment95', {
                        data: comments
                    });
                    view.AddChild(commentView);
                    view.Update();
                    this.views.push(commentView);
                    this.commentViewCache = commentView;
                    this.consoleTime('qunpro render commentView end');
                },
                getFeedCommentData(requestData) {
                    var comments = requestData.feed.vec_comment;
                    if (!comments || !comments.length) {
                        comments = [];
                    }
                    return comments;
                },
                shouldCacheCommentView(requestData) {
                    var comments = this.getFeedCommentData(requestData);

                    if (!this.commentCacheData) {
                        this.commentCacheData = comments;
                        return false;
                    }

                    var oldStr = JSON.stringify(this.commentCacheData);
                    var newStr = JSON.stringify(comments);

                    this.commentCacheData = comments;

                    return oldStr === newStr;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$b[template] && global$b[template].ViewModel && global$b[template].ViewModel.New) {
                        var model = global$b[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                UpdateRender() {
                    if (!this.views) {
                        return;
                    }

                    this.consoleTime('qunpro render start,  this.views.length  ' + this.views.length);

                    var shouldCacheHeader = this.shouldCacheHeader;
                    var shouldCacheFeed = this.shouldCacheFeed;
                    var shouldCacheImage = this.shouldCacheImage;
                    var shouldCacheRecord = this.shouldCacheRecord;
                    var shouldCacheComment = this.shouldCacheComment;

                    var headerViewCache = this.headerViewCache;
                    var feedViewCache = this.feedViewCache;
                    var imageViewCache = this.imageViewCache;
                    var recordViewCache = this.recordViewCache;
                    var commentViewCache = this.commentViewCache;

                    this.consoleTime('key: ' + this.key);
                    this.views.forEach(function(view) {

                        if (view === headerViewCache && shouldCacheHeader) {
                            return;
                        }
                        if (view === feedViewCache && shouldCacheFeed) {
                            return;
                        }
                        if (view === imageViewCache && shouldCacheImage) {

                            return;
                        }
                        if (view === recordViewCache && shouldCacheRecord) {
                            return;
                        }
                        if (view === commentViewCache && shouldCacheComment) {
                            return;
                        }
                        ArkWindow.app.UpdateRender(view);
                    });
                    this.consoleTime('qunpro render end');
                },
                polyfillFind(array) {
                    array.find = function(callback) {
                        for (var i = 0; i < array.length; i++) {
                            var find = callback(array[i]);
                            if (find) {
                                return array[i];
                            }
                        }
                    };
                },
                generateHeaderView(data) {
                    var TextView = this.generateView('header95', {
                        "data": data
                    });
                    return TextView;
                },
                generateTextView(data, hasImage) {
                    var TextView = this.generateView('text95', {
                        "data": {
                            data: data,
                            hasImage: hasImage
                        }
                    });
                    return TextView;
                },
                request() {
                    return; // PC不支持有性能问题
                },
                setSecurity() {
                    this.view.ClearChildren();
                    this.generateEmptyView();
                    var root = this.view.GetRoot();
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model, true);
                },
                generateEmptyView() {
                    if (!this.metaData.detail) {
                        return;
                    }
                    this.consoleTime('qunpro render generateEmptyView');
                    var view = this.view;
                    var data = this.metaData.detail;
                    var emptyView = this.generateView('empty', {
                        "data": data
                    });
                    this.emptyView = emptyView;
                    view.AddChild(emptyView);
                    this.consoleTime('qunpro render generateEmptyView end');
                },
                getRequestParams() {
                    var channelInfo = this.metaData.detail.channel_info;
                    var data = this.metaData.detail;
                    var feedId = data.feed_id;
                    var authorId = data.poster.str_tiny_id || data.poster.tiny_id;
                    // this.consoleTime('data'+ JSON.stringify(data, null, 2));
                    var createTime = data.feed.create_time;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var createAt = data.create_at;
                    var token = data.token;
                    var requestData = {
                        feed_id: feedId,
                        author_id: authorId,
                        create_time: createTime,
                        detail_type: 2,
                        channel_sign: {
                            guild_id: guildId,
                            channel_id: channelId,
                        },
                        channel_share_sign: {
                            create_at: createAt,
                            token: token,
                        }
                    };
                    this.consoleTime('requestParams: ' + JSON.stringify(requestData, null, 2));
                    return requestData;
                },
                generatePuin(originUin) {
                    var prefixStr = 'o';
                    var len = originUin.length;
                    var zeroLength = 0;

                    if (len < 10) {
                        zeroLength = 10 - len;
                    }

                    for (var i = 0; i < zeroLength; i += 1) {
                        prefixStr = prefixStr + '0';
                    }
                    return prefixStr + originUin;
                },
                OnActivate: function(view, active) {
                    ArkWindow.console.warn('active', active);
                    this.active = active;
                    if (active) {
                        this.request();
                    }
                },
                clickStyleActive(rootView) {
                    ArkWindow.console.warn('clickStyleActive', rootView);
                    var config = this.colorConfig;
                    var dark = global$b.getDarkColorModel(config);
                    var me = this;
                    // 按下态
                    if (dark) {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.dark);
                        ArkWindow.setTimeout(function() {
                            me.refs.texture.SetValue(me.viewColorConf.normalBg.dark);
                        }, 200);
                    } else {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.light);

                        ArkWindow.setTimeout(function() {
                            me.refs.texture.SetValue(me.viewColorConf.normalBg.light);
                        }, 200);
                    }
                },
                onClick() {
                    var data = this.metaData.detail;
                    var hasDelete = this.hasDeleteFeed;
                    var channelInfo = data.channel_info || {};
                    var view = this.view.GetRoot();

                    if (hasDelete) {
                        this.consoleTime('hasDelete' + hasDelete);
                        return;
                    }

                    var source = data.source;
                    var posterTinyId = data.poster.str_tiny_id || data.poster.tiny_id;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var guildName = channelInfo.guild_name;
                    var channelName = channelInfo.channel_name;
                    var createTime = data.feed.create_time;
                    var baseUrl = data.jump_url;
                    var feedId = data.feed_id;
                    var inviteCode = data.invite_code;

                    var visitorTinyId = '';

                    if (QQ && QQ.GetTinyId) {
                        visitorTinyId = QQ.GetTinyId();
                    }

                    var linkUrlParams = this.getParams({
                        feedId: feedId,
                        createTime: createTime,
                        posterTinyId: posterTinyId,
                        visitorTinyId: visitorTinyId,
                        guildId: guildId,
                        channelId: channelId,
                        guildName: guildName,
                        channelName: channelName,
                        inviteCode: inviteCode,
                        source: source,
                    });
                    var linkUrl = baseUrl + linkUrlParams;

                    var shouldRedirect = this.shouldRedirect();

                    if (shouldRedirect) {
                        linkUrl = this.redirectUrl(linkUrlParams);
                    }
                    this.clickStyleActive(view);
                    if (linkUrl.indexOf('mqqguild://guild/openfeeddetail') < 0) { // share链接的方式
                        linkUrl = data.jump_url;
                    }
                    ArkWindow.console.warn('linkUrl', linkUrl);
                    QQ && QQ.OpenUrl(linkUrl, view);
                },
                OnMouseDown(sender, x, y, button, keyState) {
                    var config = this.colorConfig;
                    var dark = global$b.getDarkColorModel(config);
                    if (dark) {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.dark);
                    } else {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.light);
                    }
                },
                OnMouseUp(sender, x, y, button, keyState) {

                    var config = this.colorConfig;
                    var dark = global$b.getDarkColorModel(config);
                    if (dark) {
                        this.refs.texture.SetValue(this.viewColorConf.normalBg.dark);
                    } else {
                        this.refs.texture.SetValue(this.viewColorConf.normalBg.light);
                    }
                },
                getParams(data) {
                    var feedId = data.feedId;
                    var createTime = data.createTime;
                    var posterTinyId = data.posterTinyId;
                    var visitorTinyId = data.visitorTinyId;
                    var guildId = data.guildId;
                    var channelId = data.channelId;
                    var guildName = data.guildName;
                    var channelName = data.channelName;
                    var inviteCode = data.inviteCode;
                    var source = data.source;
                    var params = '';

                    if (feedId) {
                        params = params + 'feed_id=' + this.encodeUrlParams(feedId);
                    }
                    if (inviteCode) {
                        params = params + '&';
                        params = params + 'invite_code=' + this.encodeUrlParams(inviteCode);
                    }
                    if (createTime) {
                        params = params + '&';
                        params = params + 'createtime=' + this.encodeUrlParams(createTime);
                    }
                    if (posterTinyId) {
                        params = params + '&';
                        params = params + 'poster_tinyid=' + this.encodeUrlParams(posterTinyId);
                    }
                    if (visitorTinyId) {
                        params = params + '&';
                        params = params + 'visitor_tinyid=' + this.encodeUrlParams(visitorTinyId);
                    }
                    if (guildId) {
                        params = params + '&';
                        params = params + 'guild_id=' + this.encodeUrlParams(guildId);
                    }
                    if (channelId) {
                        params = params + '&';
                        params = params + 'channel_id=' + this.encodeUrlParams(channelId);
                    }
                    if (guildName) {
                        params = params + '&';
                        params = params + 'guild_name=' + this.encodeUrlParams(guildName);
                    }
                    if (channelName) {
                        params = params + '&';
                        params = params + 'channel_name=' + this.encodeUrlParams(channelName);
                    }
                    if (source) {
                        params = params + '&';
                        params = params + 'source=' + this.encodeUrlParams(source);
                    }

                    if (!source) {
                        params = params + '&';
                        params = params + 'source=6';
                    }

                    if (source === 1) {
                        params = params + '&';
                        params = params + 'shareSource=' + 1;
                    }

                    if (!source) {
                        params = params + '&';
                        params = params + 'shareSource=' + 6;
                    }

                    if (source === 2) {
                        params = params + '&';
                        params = params + 'shareSource=' + 6;
                    }

                    return params;
                },
                encodeUrlParams(key) {
                    var keyStr = key + '';
                    if (Net && Net.UrlEncode) {
                        return Net.UrlEncode(keyStr);
                    }                return keyStr;
                },
                shouldRedirect() {
                    var version;
                    if (QQ && QQ.GetVersion) {
                        version = QQ.GetVersion();
                    }
                    var isTargetVersion = ArkWindow.util.isCurrentQQVersionBelowTargetVersion('8.8.50', version);
                    var isPc = arkWeb.System.GetOS() == 'Windows';
                    return isPc || isTargetVersion;
                },
                redirectUrl(params) {
                    return 'https://qun.qq.com/qqweb/qunpro/jump?_wv=3&_wwv=128&id=feed&' + params;
                },
                clearViewModel(timer) {
                    var clearViewModesMap = this.clearViewModesMap;
                    var me = this;
                    if (!clearViewModesMap.length) {
                        me.clearViewModelTimer = null;
                        return;
                    }
                    if (me.clearViewModelTimer && !timer) {
                        return;
                    }

                    var view = clearViewModesMap.pop();

                    me.consoleTime('deleteViewModel start');
                    var model = ArkWindow.app.GetModel(view);
                    if (model && model.Deinitialize) {
                        model.Deinitialize(view);
                        ArkWindow.app.deleteViewModel(view);
                    }
                    me.consoleTime('deleteViewModel end');

                    me.clearViewModelTimer = ArkWindow.setTimeout(function() {
                        me.clearViewModel(me.clearViewModelTimer);
                    }, 300);
                },
                clearView() {
                    this.consoleTime('clearView start');
                    var me = this;
                    this.view.ClearChildren();
                    var shouldCacheHeader = this.shouldCacheHeader;
                    var shouldCacheFeed = this.shouldCacheFeed;
                    var shouldCacheImage = this.shouldCacheImage;
                    var shouldCacheRecord = this.shouldCacheRecord;
                    var shouldCacheComment = this.shouldCacheComment;

                    var headerViewCache = this.headerViewCache;
                    var feedViewCache = this.feedViewCache;
                    var imageViewCache = this.imageViewCache;
                    var recordViewCache = this.recordViewCache;
                    var commentViewCache = this.commentViewCache;

                    var newView = [];
                    if (this.views) {
                        this.views.forEach(function(view) {
                            if (view === feedViewCache && shouldCacheFeed) {
                                newView.push(view);
                                return
                            }
                            if (view === imageViewCache && shouldCacheImage) {
                                newView.push(view);
                                return
                            }
                            if (view === recordViewCache && shouldCacheRecord) {
                                newView.push(view);
                                return
                            }
                            if (view === commentViewCache && shouldCacheComment) {
                                newView.push(view);
                                return
                            }

                            if (view === headerViewCache && shouldCacheHeader) {
                                newView.push(view);
                                return
                            }
                            me.clearViewModesMap.push(view);
                        });
                        this.views = [];
                    }
                    this.views = newView;
                    me.clearViewModel();
                    this.consoleTime('clearView end');
                },
                getBaseDuration() {
                    if (this.duration < 10) {
                        this.duration = 10;
                        return;
                    }
                    if (this.duration > 60) {
                        this.duration = 20;
                    }
                }
            }
        };
    })();

    var global$a = ArkWindow;
    (function() {
        var appView = "qun95";
        global$a[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.views = [];
                    this.refsViews = [];
                    this.iconViewList = [];
                    this.initConstants();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.detail) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }


                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.fontSize = 'size.14';

                    var hasImage = this.hasImage();

                    ArkWindow.console.log('hasImage', hasImage);

                    this.colorConfig = ArkWindow.app.config;
                    this.securityBeat = this.metaData.detail.security_beat;
                    var view = this.view.GetRoot();

                    ArkWindow.app.UpdateRender(view);

                    var key = this.metaData.detail.feed_id;
                    var data = this.getCacheFromKey(key);
                    if (data) {
                        this.metaData.detail.feed = data.content;
                        ArkWindow.app.UpdateRender(view);
                        // 强制刷新一下
                        // var time = Date.now();
                        ArkWindow.console.time('shouldRequest', String(data.time));
                        // if(!data.time) {
                        ArkWindow.console.time('shouldRequest true');
                        this.request(false);
                        return;
                        // }
                        // var timeDistance = time - data.time;
                        // // 30min 更新一下。
                        // if(timeDistance > 1800 * 1000) {
                        //     console.error('shouldRequest true');
                        //     this.request(false);
                        // }
                        // console.error('shouldRequest false');
                        // return;
                    }
                    ArkWindow.console.time('request');
                    this.request(true);
                },
                initConstants() {
                    this.viewColorConf = {
                        normalBg: {
                            light: 0xFFFFFFFF,
                            dark: 0xFF262626
                        },
                        clickBg: {
                            light: 0xFFF0F0F0,
                            dark: 0xFF232323
                        },
                    };
                },
                clickStyleActive(rootView) {
                    ArkWindow.console.warn('clickStyleActive', rootView);
                    var config = this.colorConfig;
                    var dark = global$a.getDarkColorModel(config);
                    var me = this;
                    // 按下态
                    if (dark) {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.dark);
                        global$a.setTimeout(function() {
                            me.refs.texture.SetValue(me.viewColorConf.normalBg.dark);
                        }, 200);
                    } else {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.light);
                        global$a.setTimeout(function() {
                            me.refs.texture.SetValue(me.viewColorConf.normalBg.light);
                        }, 200);
                    }
                },
                generateC2C(orgData) {
                    ArkWindow.console.time('startGenerateC2C');
                    var feed = orgData.feed;
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseData = global$a.parseFeed(feed, guildId);
                    var title = this.getTitle(parseData);
                    var dataArr = this.getRenderData(parseData);
                    var c2cView = this.generateView('c2c', {
                        c2c: {
                            channel: orgData.channel_info,
                            dataArr: dataArr,
                            title: title,
                        }
                    });
                    var view = this.view;
                    view.ClearChildren();
                    view.AddChild(c2cView);
                    // this.views.push(c2cView);
                    ArkWindow.console.time('endGenerateC2C');
                },

                hasImage() {
                    var data = this.metaData.detail;
                    var images = this.generateImage(data);

                    if (!images) {
                        return false;
                    }

                    if (!images.length) {
                        return false;
                    }

                    return true;
                },
                onClick() {
                    var data = this.metaData.detail;

                    var channelInfo = data.channel_info || {};
                    var view = this.view.GetRoot();

                    var posterTinyId = data.poster.str_tiny_id || data.poster.tiny_id;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var guildName = channelInfo.guild_name;
                    var channelName = channelInfo.channel_name;
                    var createTime = data.feed.create_time;
                    var baseUrl = data.jump_url;
                    var feedId = data.feed_id;
                    var inviteCode = data.invite_code;
                    var source = data.source;

                    var visitorTinyId = '';

                    if (QQ && QQ.GetTinyId) {
                        visitorTinyId = QQ.GetTinyId();
                    }

                    var linkUrlParams = this.getParams({
                        feedId: feedId,
                        createTime: createTime,
                        posterTinyId: posterTinyId,
                        visitorTinyId: visitorTinyId,
                        guildId: guildId,
                        channelId: channelId,
                        guildName: guildName,
                        channelName: channelName,
                        inviteCode: inviteCode,
                        source: source,
                    });

                    var linkUrl = baseUrl + linkUrlParams;

                    var shouldRedirect = this.shouldRedirect();
                    ArkWindow.console.warn('shouldRedirect', shouldRedirect);

                    if (shouldRedirect) {
                        linkUrl = this.redirectUrl(linkUrlParams);
                    }
                    ArkWindow.console.warn('linkUrl', linkUrl);
                    this.clickStyleActive(view);
                    if (linkUrl.indexOf('mqqguild://guild/openfeeddetail') < 0) { // share链接的方式
                        linkUrl = data.jump_url;
                    }
                    QQ && QQ.OpenUrl(linkUrl, view);
                },
                OnMouseDown(sender, x, y, button, keyState) {
                    var me = this;
                    var config = this.colorConfig;
                    var dark = global$a.getDarkColorModel(config);
                    if (dark) {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.dark);
                        global$a.setTimeout(function() {
                            me.refs.texture.SetValue(me.viewColorConf.normalBg.dark);
                        }, 200);
                    } else {
                        this.refs.texture.SetValue(this.viewColorConf.clickBg.light);
                        global$a.setTimeout(function() {
                            me.refs.texture.SetValue(me.viewColorConf.normalBg.light);
                        }, 200);
                    }
                },
                OnMouseUp(sender, x, y, button, keyState) {

                    var config = this.colorConfig;
                    var dark = global$a.getDarkColorModel(config);
                    if (dark) {
                        this.refs.texture.SetValue(this.viewColorConf.normalBg.dark);
                    } else {
                        this.refs.texture.SetValue(this.viewColorConf.normalBg.light);
                    }
                },
                getParams(data) {
                    var feedId = data.feedId;
                    var createTime = data.createTime;
                    var posterTinyId = data.posterTinyId;
                    var visitorTinyId = data.visitorTinyId;
                    var guildId = data.guildId;
                    var channelId = data.channelId;
                    var guildName = data.guildName;
                    var channelName = data.channelName;
                    var inviteCode = data.inviteCode;
                    var source = data.source;
                    var params = '';

                    if (feedId) {
                        params = params + 'feed_id=' + this.encodeUrlParams(feedId);
                    }
                    if (inviteCode) {
                        params = params + '&';
                        params = params + 'invite_code=' + this.encodeUrlParams(inviteCode);
                    }
                    if (createTime) {
                        params = params + '&';
                        params = params + 'createtime=' + this.encodeUrlParams(createTime);
                    }
                    if (posterTinyId) {
                        params = params + '&';
                        params = params + 'poster_tinyid=' + this.encodeUrlParams(posterTinyId);
                    }
                    if (visitorTinyId) {
                        params = params + '&';
                        params = params + 'visitor_tinyid=' + this.encodeUrlParams(visitorTinyId);
                    }
                    if (guildId) {
                        params = params + '&';
                        params = params + 'guild_id=' + this.encodeUrlParams(guildId);
                    }
                    if (channelId) {
                        params = params + '&';
                        params = params + 'channel_id=' + this.encodeUrlParams(channelId);
                    }
                    if (guildName) {
                        params = params + '&';
                        params = params + 'guild_name=' + this.encodeUrlParams(guildName);
                    }
                    if (channelName) {
                        params = params + '&';
                        params = params + 'channel_name=' + this.encodeUrlParams(channelName);
                    }
                    if (source) {
                        params = params + '&';
                        params = params + 'source=' + this.encodeUrlParams(source);
                    }

                    if (!source) {
                        params = params + '&';
                        params = params + 'source=2';
                    }

                    if (source === 1) {
                        params = params + '&';
                        params = params + 'shareSource=' + 1;
                    }

                    if (source === 2) {
                        params = params + '&';
                        params = params + 'shareSource=' + 6;
                    }

                    if (!source) {
                        params = params + '&';
                        params = params + 'shareSource=' + 6;
                    }
                    return params;
                },
                encodeUrlParams(key) {
                    var keyStr = key + '';
                    if (Net && Net.UrlEncode) {
                        return Net.UrlEncode(keyStr);
                    }                return keyStr;
                },
                shouldRedirect() {
                    var version;
                    if (QQ && QQ.GetVersion) {
                        version = QQ.GetVersion();
                    }
                    var isTargetVersion = ArkWindow.util.isCurrentQQVersionBelowTargetVersion('8.8.50', version);
                    var isPc = arkWeb.System.GetOS() == 'Windows';
                    return isPc || isTargetVersion;
                },
                redirectUrl(params) {
                    return 'https://qun.qq.com/qqweb/qunpro/jump?_wv=3&_wwv=128&id=feed&' + params;
                },
                hasAllFeed() {
                    var feed = this.metaData.detail.feed;
                    ArkWindow.console.time('hasAllFeed: ' + !!feed.contents);
                    return !!feed.contents;
                },
                UpdateRender() {
                    this.renderView();
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                },
                renderView() {
                    var data = this.metaData.detail;
                    this.generateRender(data);
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.UpdateRender();
                },
                generateRender(orgData) {
                    var feed = orgData.feed;
                    this.renderHeader();
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseData = global$a.parseFeed(feed, guildId);
                    this.getRenderData(parseData);
                    // 处理表情记录
                    if (this.shouldCacheRecord && this.recordViewCache) {
                        this.view.AddChild(this.recordViewCache);
                    } else {
                        this.setFeedTitle(parseData, {
                            twoLine: true
                        });
                        this.generateRecord(orgData);
                    }
                    this.renderImage95(orgData);

                    var root = this.view.GetRoot();
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model);
                    model.shouldReset = true;
                },
                cacheImage(imageUrl, requestTime, callback) {
                    var data = arkWeb.Storage.Load(imageUrl);
                    var me = this;
                    if (data && data.width && data.height) {
                        ArkWindow.console.warn('cachedImage', imageUrl);
                        return callback(data);
                    }

                    ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                        if (err) {
                            ArkWindow.console.warn(imageUrl + ' OnError', err);
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        }

                        var img = UI.Image();
                        img.AttachEvent("OnError", function(sender) {
                            ArkWindow.console.warn(imageUrl, ' OnError');
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        });

                        img.AttachEvent("OnLoad", function(sender) {
                            ArkWindow.console.log(imageUrl + ' OnLoad');

                            var size = sender.GetSize();
                            ArkWindow.console.log('width: ' + size.width + ' height: ' + size.height);

                            arkWeb.Storage.Save(imageUrl, {
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                            callback({
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                        });

                        img.SetValue(path);
                    });
                },
                generateRecord(requestData) {
                    ArkWindow.console.warn('qun render generateRecord');
                    var view = null;
                    if (!this.refs.qunFeedEmojiRecord) {
                        this.refs.qunFeedEmojiRecord = this.view.GetUIObject('qunFeedEmojiRecord');
                    }
                    view = this.refs.qunFeedEmojiRecord;
                    view.ClearChildren();
                    var defaultEmotionReaction = {
                        "emoji_reaction_list": [{
                                "emoji_id": "76",
                                "emoji_type": 1
                            },
                            {
                                "emoji_id": "311",
                                "emoji_type": 1
                            },
                            {
                                "emoji_id": "271",
                                "emoji_type": 1
                            }
                        ]
                    };
                    var emojiData = requestData.feed.emotion_reaction || defaultEmotionReaction;
                    if (!emojiData) {
                        return;
                    }
                    var commentCount = requestData.feed.comment_count || [];
                    // 换浏览量
                    var viewCount = requestData.feed.view_count || '';
                    //点赞数
                    var preferCount = requestData.feed.prefer_count;
                    var emojiCount = requestData.feed.emotion_total_count;
                    var orgEmojis = emojiData.emoji_reaction_list || [];
                    var emojiPics = orgEmojis.sort(function(last, pre) {
                        return last.cnt - pre.cnt;
                    });

                    var recordData = {
                        commentCount: commentCount,
                        preferCount: preferCount,
                        viewCount: viewCount,
                        emojiCount: emojiCount,
                        emojiPics: emojiPics,
                        isChannel: this.metaData.isChannel,
                        isPreview: this.metaData.isPreview
                    };
                    var recordView = this.generateView('record', {
                        data: recordData
                    });
                    view.AddChild(recordView);
                    view.Update();
                    // this.views.push(recordView);
                    this.recordViewCache = recordView;
                },
                renderImage95(parseData) {
                    var images = this.generateImage(parseData);
                    if (images.length === 0) {
                        // 没有图片填充默认图
                        this.renderEmptyImage(parseData);
                    }
                    if (images && images.length === 1) {
                        this.renderOneImage(parseData);
                    }
                    if (images && images.length == 2) {
                        this.setDoubleImage(images);
                        return;
                    }
                    if (images && images.length >= 3) {
                        this.setThirdImage(images);
                    }

                },
                renderEmptyImage(orgData) {
                    var targetImage = {
                        height: 164.4,
                        pic_url: "images/qun_empty_img_bg.png",
                        width: 239
                    };
                    var me = this;
                    var wrap = this.view.GetUIObject('qunFeedImage');
                    var contentWrap = this.view.GetUIObject('qunFeedImageWrap');

                    this.refs.qunFeedImage = wrap;
                    this.refs.qunFeedImageWrap = contentWrap;

                    var url = targetImage.pic_url;
                    contentWrap.SetVisible(true);

                    var texture = wrap.GetUIObject('qunFeedImageTexture');
                    me.refs.qunFeedImageTexture = texture;
                    texture.SetValue(url);
                    texture.SetMode('fill');

                    // 获取图片层宽高
                    var rootSize = wrap.GetSize();
                    var rootWidth = rootSize.width;
                    var height = rootWidth * (targetImage.height / targetImage.width);

                    // 设置背景图片高度
                    texture.SetStyle("display:flex;width:100%;height:" + height);
                    texture.SetVisible(true);
                    texture.Update();
                    // 设置背景图父级高度
                    this.refs.qunFeedImage.SetStyle('display:flex;width:100%;height:' + height);
                    this.refs.qunFeedImage.Update();

                    // 设置文字层
                    var feed = orgData.feed;
                    var guildId = this.metaData.detail.channel_info.str_guild_id;
                    var parseData = global$a.parseFeed(feed, guildId);
                    ArkWindow.console.log("parseData");
                    ArkWindow.console.log(JSON.stringify(parseData));
                    var dataArr = this.getRenderData(parseData);
                    this.refs.qunFeedImageEmptyWrap = this.view.GetUIObject('qunFeedImageEmptyWrap');
                    var emptyWrapHeight = (height - 24);
                    this.refs.qunFeedImageEmptyWrap.SetStyle('display:flex;width:' + (rootWidth - 24) + ';height:' + emptyWrapHeight + ';position: absolute;top:12;left:12;');
                    this.refs.qunFeedImageEmptyWrap.SetVisible(true);
                    this.refs.qunFeedImageEmptyWrap.Update();
                    me.refs.qunFeedImgEmptyText = wrap.GetUIObject('qunFeedImgEmptyText');
                    this.generateFeedEmpty(dataArr, me.refs.qunFeedImgEmptyText, this.refs.qunFeedImageEmptyWrap);
                    me.refs.qunFeedImgEmptyText.SetStyle('display:flex;flexDirection:row;height:auto;alignItems:center;justifyContent:center;padding:0 20 0 20;marginBottom:0;width:auto;');
                },
                renderOneImage(parseData) {
                    var images = this.generateImage(parseData);
                    var targetImage;
                    var me = this;
                    var wrap = this.view.GetUIObject('qunFeedImage');
                    var contentWrap = this.view.GetUIObject('qunFeedImageWrap');
                    this.refs.qunFeedImage = wrap;
                    this.refs.qunFeedImageWrap = contentWrap;
                    // wrap.ClearChildren();
                    if (images && images.length) {
                        targetImage = images[0];
                    }
                    if (!targetImage) {
                        contentWrap.SetVisible(false);
                        return;
                    }
                    var url = targetImage.pic_url;
                    contentWrap.SetVisible(true);
                    var requestTime = 3;
                    var width, height;
                    this.cacheImage(url, requestTime, function(data) {
                        if (!data || !data.path) {
                            ArkWindow.console.warn('no imageData', url);
                            return;
                        }
                        var path = data.path;
                        width = data.width;
                        height = data.height;
                        var radio = (width / height) || (1188 / 501);
                        var rootSize = wrap.GetSize();
                        var rootWidth = rootSize.width;
                        var rootHeight = rootSize.height;
                        ArkWindow.console.log('aaa rootHeight', rootWidth, rootHeight, radio);
                        var rootRadio = rootWidth / rootHeight;
                        var texture = wrap.GetUIObject('qunFeedImageTexture');
                        me.refs.qunFeedImageTexture = texture;
                        texture.SetValue(path);
                        if (rootRadio > radio) {
                            width = rootWidth;
                            height = rootWidth / radio;
                            var top = (height - rootHeight) / 2;
                            ArkWindow.console.warn(width, height);
                            texture.SetSize(width, height);
                            texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + width + ";height:" + height);
                        } else {
                            width = rootHeight * radio;
                            height = rootHeight;
                            var left = -1 * (width - rootWidth) / 2;
                            texture.SetSize(width, rootHeight);
                            ArkWindow.console.log('aaa heightheigt', width, height, radio);
                            texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + width + ";height:" + height);
                        }
                    });
                    if (targetImage.isVideo) {
                        ArkWindow.console.log('aaa createVideoIcon renderOneImage');
                        me.clearIconView();
                        var icon = me.createVideoIcon(width, height);

                        contentWrap.AddChild(icon);
                    }
                    contentWrap.Update();
                    me.view.Update();
                },
                setDoubleImage(images) {
                    var me = this;
                    me.refs.qunFeedImageView = this.view.GetUIObject('qunFeedImage');
                    me.refs.qunFeedImageView.ClearChildren();
                    me.refs.qunFeedImageView.SetRadius(6, 6, 6, 6);
                    var size = me.refs.qunFeedImageView.GetSize();
                    var width = size.width * 49.8 / 100;
                    var margin = size.width * 0.2 / 100;
                    if (width === 0) {
                        return;
                    }
                    if (this.metaData.isPreview) {
                        width = size.width * 49.5 / 100;
                        margin = size.width * 0.5 / 100;
                    }
                    var height = width * (684 / 910) * 2;

                    var rootWidth = width;
                    var rootHeight = height;

                    me.wrapHeight = width;
                    me.temViewsArray = [];

                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;
                        var styleStr = 'display:flex;position:relative;width:' + width + ';height:' + height + ';marginRight:' + margin;
                        imageView.SetStyle(styleStr);

                        if (!image) {
                            return;
                        }
                        var texture = UI.Image();
                        me.temViewsArray.push(texture);
                        texture.SetSize(width, height);

                        texture.SetStyle("display:flex;width:100%;height:auto;");
                        me.refs.qunFeedImageView.AddChild(imageView);
                        texture.SetMode('aspectfill');
                        imageView.AddChild(texture);
                        if (image.isVideo) {
                            ArkWindow.console.log('aaa rootWidth, rootHeight - 100', String(rootWidth), String(rootHeight - 100));
                            ArkWindow.console.log('aaa createVideoIcon setDoubleImage');
                            me.clearIconView();
                            var icon = me.createVideoIcon(rootWidth, rootHeight, 'double');
                            imageView.AddChild(icon);
                        }
                        imageView.Update();
                        me.view.Update();
                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.warn('no imageData', url);
                                return;
                            }
                            var path = data.path;
                            ArkWindow.console.error('texture', !!texture);
                            if (texture) {
                                texture.SetValue(path);
                            }
                        });
                    });
                },
                setThirdImage(images, extraLen) {
                    var me = this;
                    var size = this.view.GetSize();
                    var width = size.width * 49.8 / 100;
                    var height = width * (684 / 910) * 2;
                    if (width === 0 || height === 0) {
                        return;
                    }
                    var margin = size.width * 0.2 / 100;
                    if (!this.refs.qunFeedImageView) {
                        this.refs.qunFeedImageView = this.view.GetUIObject('qunFeedImage');
                        this.refs.qunFeedImageView.SetRadius(6, 6, 6, 6);
                    }
                    me.refs.qunFeedImageView.ClearChildren();
                    me.wrapHeight = width;
                    me.refs.qunFeedImageView.SetStyle('image-wrap-three-95');
                    this.refs.qunFeedImageView.Update();
                    me.texturesRefs = [];
                    me.viewImgRefs = [];
                    me.temViewsArray = [];

                    var rightView = UI.View();
                    var rightViewStyle = 'display:flex;flexDirection:column;justifyContent:space-between;position:relative;width:' + Math.ceil(width) + ';height:' + Math.ceil(height) + ';marginRight:' + margin;
                    rightView.SetStyle(rightViewStyle);
                    this.refs.qunFeedImageView.AddChild(rightView);
                    images = images.slice(0, 3);
                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;

                        var styleStr = 'display:flex;position:relative;width:' + Math.ceil(width) + ';height:' + Math.ceil(height) + ';marginRight:' + margin;
                        if (index === 2) {
                            styleStr += ';marginTop:0.5';
                        }
                        imageView.SetStyle(styleStr);
                        if (index === 1 || index === 2) {
                            rightView.AddChild(imageView);
                            rightView.Update();
                        } else {
                            me.refs.qunFeedImageView.AddChild(imageView);
                        }
                        me.refs.qunFeedImageView.Update();

                        me.refs.qunFeedImageView.SetSize(size.width, Math.ceil(width));
                        if (!image) {
                            return;
                        }

                        var texture = UI.Image();
                        me.temViewsArray.push(texture);
                        me.refs.qunFeedImageTexture = texture;
                        texture.SetSize(width, height);

                        texture.SetStyle("display:flex;width:100%;height:auto;");
                        texture.SetMode('aspectfill');
                        imageView.AddChild(texture);
                        imageView.Update();

                        me.texturesRefs.push(texture);
                        me.viewImgRefs.push(imageView);

                        if (image.isVideo) {
                            ArkWindow.console.log('aaa createVideoIcon setThirdImage');
                            me.clearIconView();
                            var icon = me.createVideoIcon(width, height);
                            imageView.AddChild(icon);
                        }
                        imageView.Update();
                        me.view.Update();

                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.timeLog('no imageData', url);
                                return;
                            }
                            var texture = me.texturesRefs[index];
                            var path = data.path;
                            if (texture) {
                                texture.SetValue(path);
                            } else {
                                ArkWindow.console.error(me.texturesRefs[index], index, me.texturesRefs);
                            }
                        });
                    });
                },
                clearIconView() {
                    this.iconViewList.forEach((iconView) => {
                        if (!iconView) {
                            return;
                        }
                        const parentView = iconView.GetParent();
                        parentView && parentView.DeleteChild(iconView);
                        ArkWindow.console.log('aaa deleteChild', iconView);
                    });
                    this.iconViewList = [];
                },
                createVideoIcon(width, height, type) {
                    type = type || '';
                    if (width === 0 || height === 0) {
                        return;
                    }
                    ArkWindow.console.log('aaa createVideoIcon', width, height);
                    var view = UI.View();
                    var image = UI.Image();
                    this.refsViews.push(view);
                    this.refsViews.push(image);
                    view.SetStyle('video-icon-wrap-95' + type);
                    image.SetStyle('video-icon-95');
                    image.SetValue('images/btn_play.png');
                    // this.clipImage(view, width, height);
                    view.AddChild(image);
                    this.iconViewList.push(view);
                    return view;
                },
                clipImage: function(view, rootWidth, rootHeight) {
                    var me = this;
                    var radio = 1;
                    var rootRadio = rootWidth / rootHeight;
                    var texture = UI.Image();
                    me.refsViews.push(texture);
                    me.refs.qunFeedImageMask = texture;
                    if (rootRadio > radio) {
                        var dataWidth = rootWidth;
                        var dataHeight = rootWidth / radio;
                        var top = (dataHeight - rootHeight) / 2;

                        ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                        texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + dataWidth + ";height:" + dataHeight);
                    } else {
                        var dataWidth = rootHeight * radio;
                        var dataHeight = rootHeight;
                        var left = -1 * (dataWidth - rootWidth) / 2;
                        texture.SetSize(dataWidth, rootHeight);

                        ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                        texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + dataWidth + ";height:" + dataHeight);
                    }
                    ArkWindow.console.error('images/mask.png', !!texture);
                    if (texture) {
                        texture.SetValue('images/mask.png');
                    }
                    view.AddChild(texture);
                },
                renderHeader() {
                    var avatarView = this.view.GetUIObject('avatar');
                    var guildNameView = this.view.GetUIObject('guildName');

                    this.refs.avatarView = avatarView;
                    this.refs.guildNameView = guildNameView;

                    var channelInfo = this.metaData.detail.channel_info;
                    var guildId = channelInfo.str_guild_id;
                    var avatar = channelInfo.guild_icon || global$a.getAvatar(guildId);
                    var guildName = channelInfo.guild_name;

                    var colorConfig = this.colorConfig;
                    var isDark = global$a.getDarkColorModel(colorConfig);
                    var color = 0xFF999999;
                    var bgColor = 0xFFFFFFFF;
                    if (isDark) {
                        color = 0xFFE8E9EA;
                        bgColor = 0xFF262626;
                    }
                    avatarView.SetValue(avatar);
                    guildNameView.SetValue(guildName);
                    guildNameView.SetTextColor(color);
                    var target = this.view.GetUIObject('qunFeedContentWrap');
                    this.refs.qunFeedContentWrap = target;
                    var texture = target.GetTexture('bgColor');
                    texture.SetValue(bgColor);
                    this.refs.texture = texture;
                    this.refs.qunFeed95View = this.view.GetUIObject('qunFeed95View');

                    this.refs.qunFootSpaceView = this.view.GetUIObject('qunFootSpaceView');
                    this.refs.footSpaceTexture = this.refs.qunFootSpaceView.GetTexture('footSpaceTexture');
                    this.refs.businessName = this.view.GetUIObject('businessName');
                    this.refs.qunFeed95View.SetVisible(true);
                    if (isDark) {
                        this.refs.footSpaceTexture.SetValue(0xFF151516);
                        this.refs.businessName.SetTextColor(color);
                    }
                },
                generateFeed(dataArr, view) {
                    view.ClearChildren();
                    var font = 'size.12';
                    var color = 0xFFA2A5AC;
                    var config = this.colorConfig;
                    var isDark = global$a.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFF838387;
                    }
                    var renderWidth = view.GetSize().width;
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                generateFeedEmpty(dataArr, view, parentView) {
                    var renderWidth = parentView.GetSize().width;
                    view.ClearChildren();
                    var font = 'size.12';
                    var color = 0xFFA2A5AC;
                    var config = this.colorConfig;
                    var isDark = global$a.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFF838387;
                    }
                    // this.renderFirstData(renderWidth-48,view,dataArr,font,color);
                    // var secondDataView = UI.View();
                    // secondDataView.SetStyle('qun-feed-img-empty-text-95');
                    // parentView.AddChild(secondDataView);
                    // parentView.Update();
                    // console.log('secend dataArr', JSON.stringify(dataArr));
                    this.renderSecondData(renderWidth - 48, view, dataArr, font, color);
                    // this.renderSecondDataEmpty(renderWidth-100, secondDataView, dataArr, font, color);
                },
                setFeedTitle(data) {
                    var view = this.view.GetUIObject('qunFeedTitle');

                    this.refs.qunFeedTitle = view;

                    view.ClearChildren();
                    var font = 'size.17';
                    var color = 0xFF03081A;
                    var config = this.colorConfig;
                    var isDark = global$a.getDarkColorModel(config);
                    if (isDark) {
                        color = 0xFFE8E9EA;
                    }
                    var title = this.getTitle(data);
                    var renderWidth = view.GetSize().width;
                    var dataArr = [{
                        isText: true,
                        text: title
                    }];
                    this.renderFirstData(renderWidth, view, dataArr, font, color);
                    var secondDataView = UI.View();
                    secondDataView.SetStyle('feed-title-second-wrap-95');
                    view.AddChild(secondDataView);
                    view.Update();
                    this.renderSecondData(renderWidth, secondDataView, dataArr, font, color);
                },
                renderFirstData(renderWidth, view, dataArr, font, color) {
                    var margin = global$a.isAndroid() ? 4 : 13;
                    this.renderDataView(renderWidth, view, dataArr, font, color, margin, false);
                },
                generateImage(requestData) {
                    var imgData = [];
                    if (requestData.feed.videos && requestData.feed.videos[0] && requestData.feed.videos[0].cover && requestData.feed.videos[0].cover.pic_url) {
                        var tmpO = requestData.feed.videos[0].cover || {};
                        tmpO.isVideo = true;
                        imgData.push(tmpO);
                    }
                    // console.log('aaa thirdVideos', requestData);
                    if (requestData && requestData.feed && requestData.feed.contents && requestData.feed.contents.contents) {
                        const contents = requestData.feed.contents.contents;
                        ArkWindow.console.log('aaa contents', contents instanceof Array);

                        const thirdVideos = contents.filter((item) => item.type === 3 && item.url_content && item.url_content.type === 1 && item.url_content.third_video_info && item.url_content.third_video_info.cover);
                        ArkWindow.console.log('aaa thirdVideos', JSON.stringify(thirdVideos));
                        thirdVideos.forEach((item) => {
                            imgData.push({
                                isVideo: true,
                                pic_url: item.url_content.third_video_info.cover,
                                width: 1080,
                                height: 1920,
                            });

                        });
                        ArkWindow.console.log('aaa thirdTXDoc imgData', JSON.stringify(imgData));
                        const tencentDocs = contents.filter((item) => item.type === 3 && item.url_content && item.url_content.tencent_docs_content && item.url_content.tencent_docs_content.url);
                        tencentDocs.forEach((item) => {
                            imgData.push({
                                isVideo: false,
                                isTencentDoc: true,
                                pic_url: item.url_content.tencent_docs_content.url,
                                width: 465,
                                height: 338,
                            });

                        });
                        ArkWindow.console.log('aaa tencentDocs imgData', JSON.stringify(imgData));
                    }
                    if (requestData.feed.images && requestData.feed.images.length) {
                        imgData = imgData.concat(requestData.feed.images);
                    }
                    if (!imgData.length) {
                        return [];
                    }

                    this.replaceImages(imgData);
                    return imgData;
                },

                replaceImages(imgs) {
                    imgs.forEach(function(img) {
                        if (img && img.pic_url) {
                            img.pic_url = img.pic_url.replace('&t=7', '&t=5');
                        }
                    });
                },

                getRenderData(parseDatas) {
                    var orgData = parseDatas;
                    if (!orgData) {
                        return [];
                    }
                    var dataArr = this.mergeData(orgData);
                    return dataArr;
                },
                mergeData(orgData) {
                    var data = [];
                    for (var i = 1; i < orgData.length; i++) {
                        if (orgData[i] && orgData[i].data && orgData[i].data.length) {
                            orgData[i].data.forEach(function(item) {
                                data.push(item);
                            });
                        }
                    }
                    return data;
                },
                resetHeight() {},
                renderFirstData(renderWidth, view, dataArr, font, color) {
                    this.renderDataView(renderWidth, view, dataArr, font, color);
                },
                getEmoji(dataArr) {
                    var target = [];
                    dataArr.forEach(function(data) {
                        if (data.isText) {
                            var arr = global$a.parseEm(data.text);
                            target = target.concat(arr);
                            return;
                        }
                        target.push(data);
                    });
                    return target;
                },
                renderSecondData(renderWidth, view, dataArr, font, color) {
                    var fontSize = font || this.fontSize;
                    var dashWidth = this.measureText('...', fontSize);
                    var shouldAppend = this.renderDataView(renderWidth - dashWidth, view, dataArr, fontSize, color);
                    if (dataArr.length && !shouldAppend) {
                        var textView = this.getTextView('...', fontSize, color);
                        view.AddChild(textView);
                        return
                    }
                },
                renderSecondDataEmpty(renderWidth, view, dataArr, font, color) {
                    var fontSize = font || this.fontSize;
                    var dashWidth = this.measureText('...', fontSize);
                    this.renderDataView(renderWidth - dashWidth, view, dataArr, fontSize, color);
                    if (dataArr.length) {
                        var textView = this.getTextView('...', fontSize, color);
                        view.AddChild(textView);
                        return
                    }
                },
                renderDataViewEmpty(renderWidth, view, dataArr, font, color) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    var totalText = '';
                    while (dataArr.length && width >= 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText || data.isUrl || data.isLinkMember || data.isLinkGuild) {
                            totalText += text;
                        }
                    }
                    var totalTextView = UI.Text();
                    totalTextView.SetValue(totalText);
                    totalTextView.SetFont(targetFont);
                    totalTextView.SetTextColor(color);
                    view.AddChild(totalTextView);
                    totalTextView.SetMultiline(true);
                    totalTextView.SetMaxline(3);
                    totalTextView.SetEllipsis(true);
                    totalTextView.Update();
                    var totalTextViewSize = totalTextView.MeasureTextSize();

                    totalTextViewSize.height > 0 && totalTextView.SetStyle('display:flex;width:100%;height:' + (Number(totalTextViewSize.height) + 18.5));

                },
                renderDataView(renderWidth, view, dataArr, font, color) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    while (dataArr.length && width >= 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {
                            var textWidth = this.measureText(text, targetFont);
                            if (textWidth >= width) {
                                // 超过一行
                                var maxRenderWidth = this.getMaxRenderLength(text, width, font);
                                if (maxRenderWidth < 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, targetFont, color);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, targetFont, color);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }

                        if (data.isLinkMember) {
                            if (text && text.length) {
                                if (text[0] === '@') {
                                    text = text.slice(1);
                                }
                            }

                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuild) {
                            if (text && text.length) {
                                if (text[0] === '*') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink(text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getGuildView(text, data.channelType);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isTopic) {
                            var linkWidth = this.measureLink(text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView(text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isGroup) {
                            var linkWidth = this.measureLink(text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getGroupView(text, data.groupCode);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var imageView = this.getEmojiView(data.url, data.id);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }

                        if (data.isEmpty && width > 2) {
                            var emptyView = this.getEmptyView(width);
                            view.AddChild(emptyView);
                            width = 0;
                            return true;
                        }
                    }
                },
                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    ArkWindow.console.time('render count: ' + (c + 2));

                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var text = UI.Text();
                    text.SetValue(textStr);
                    text.SetFont(size);
                    var size = text.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 14
                },
                getEmojiView(url, id) {
                    var imageView = UI.Image();
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji-95');
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        var value = image.GetValue();
                        ArkWindow.console.warn(value + ' OnError');
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                        }
                    });
                },
                getEmptyView(width) {
                    var emptyView = UI.View();
                    var styleStr = 'display:flex;height:auto;width:' + (width);
                    emptyView.SetStyle(styleStr);
                    return emptyView;
                },
                getTextView(textStr, size, color) {
                    var textView = UI.Text();
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    if (color) {
                        textView.SetTextColor(color);
                    } else {
                        textView.SetTextColor(0xFFA2A5AC);
                    }
                    return textView
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    this.views.push(view);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$a[template] && global$a[template].ViewModel && global$a[template].ViewModel.New) {
                        var model = global$a[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                getLinkView(textStr, isImage) {
                    ArkWindow.console.warn('isImage', textStr, !!isImage);
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: isImage
                        }
                    });
                    return linkView;
                },
                getGroupView(textStr, groupCode) {
                    var linkView = this.generateView('group', {
                        data: {
                            textStr: textStr,
                            groupCode: groupCode
                        }
                    });
                    return linkView;
                },
                getGuildView(textStr, channelType) {
                    var linkView = this.generateView('guild', {
                        data: {
                            textStr,
                            channelType,
                        }
                    });
                    return linkView;
                },
                getTitle(data) {
                    var orgData = data;
                    if (orgData && orgData[0] && orgData[0].data && orgData[0].data[0] && orgData[0].data[0].text) {
                        return orgData[0].data[0].text;
                    }
                    return '';
                },
                polyfillFind(array) {
                    array.find = function(callback) {
                        for (var i = 0; i < array.length; i++) {
                            var find = callback(array[i]);
                            if (find) {
                                return array[i];
                            }
                        }
                    };
                },
                request(shouldUpdateUI) {
                    return; // 更新有闪动问题先不做更新
                },
                cache(feed) {
                    var key = this.metaData.detail.feed_id;
                    var dataStr = JSON.stringify(feed);
                    arkWeb.Storage.Save(key, {
                        time: Date.now(),
                        content: dataStr
                    });
                },
                getCacheFromKey(key) {
                    var data = arkWeb.Storage.Load(key);
                    if (data && data.content) {
                        return {
                            content: JSON.parse(data.content),
                            time: data.time,
                        }
                    }
                    return null;
                },
                getRequestParams() {
                    var channelInfo = this.metaData.detail.channel_info;
                    var data = this.metaData.detail;
                    var feedId = data.feed_id;
                    var authorId = data.poster.str_tiny_id || data.poster.tiny_id;
                    var createTime = data.feed.create_time;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    var createAt = data.create_at;
                    var token = data.token;
                    var requestData = {
                        feed_id: feedId,
                        author_id: authorId,
                        create_time: createTime,
                        detail_type: 2,
                        channel_sign: {
                            guild_id: guildId,
                            channel_id: channelId,
                        },
                        channel_share_sign: {
                            create_at: createAt,
                            token: token,
                        }
                    };
                    ArkWindow.console.time('requestData:' + JSON.stringify(requestData, null, 2));
                    return requestData;
                },
                generatePuin(originUin) {
                    var prefixStr = 'o';
                    var len = originUin.length;
                    var zeroLength = 0;

                    if (len < 10) {
                        zeroLength = 10 - len;
                    }

                    for (var i = 0; i < zeroLength; i += 1) {
                        prefixStr = prefixStr + '0';
                    }
                    return prefixStr + originUin;
                },
            }
        };
    })();

    var global$9 = ArkWindow;
    (function() {
        var appView = "text95";
        global$9[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    this.view.hasUpdate = true;
                    this.colorConfig = ArkWindow.app.config;
                    this.refs = {};
                    this.fontSize = 'size.16';
                    if (!this.metaData.data.hasImage) {
                        this.view.SetStyle('feed-wrap-no-img-95');
                    }
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.hasUpdateRender = false;
                    this.UpdateRender();
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$9[template] && global$9[template].ViewModel && global$9[template].ViewModel.New) {
                        var model = global$9[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                updateDartView() {},
                UpdateRender() {
                    this.refs = {};
                    var orgData = this.metaData.data.data;

                    if (!orgData) {
                        return;
                    }

                    // 标识位
                    if (this.hasUpdateRender) {
                        return;
                    }
                    this.hasUpdateRender = true;
                    this.temViews = [];

                    ArkWindow.console.time('textView UpdateRender start');
                    this.setFeedTitle();
                    var view = this.view.GetUIObject('feedContent');
                    view.ClearChildren();
                    this.refs.feedContentView = view;
                    var dataArr = this.getRenderData();
                    var renderWidth = view.GetSize().width;
                    ArkWindow.console.time('textView render renderFirstData');
                    var feedDescStyleMap = {
                        color: {
                            light: 0xFFA2A5A7,
                            dark: 0xFF838387,
                        },
                        size: 'size.13'
                    };
                    var config = this.colorConfig || ArkWindow.app.config;
                    var isDark = global$9.getDarkColorModel(config);
                    var color = isDark ? feedDescStyleMap.color.dark : feedDescStyleMap.color.light;
                    this.renderFirstData(renderWidth, view, dataArr, feedDescStyleMap.size, color);
                    ArkWindow.console.time('textView render renderSecondData');
                    this.renderSecondData(renderWidth, view, dataArr, feedDescStyleMap.size, color);
                    ArkWindow.console.time('textView render end');
                },
                getRenderData() {
                    var orgData = this.metaData.data.data;
                    var dataArr = this.mergeData(orgData);
                    return dataArr.slice(0, 5);
                },
                mergeData(orgData) {
                    var data = [];
                    if (!orgData) {
                        return [];
                    }
                    for (var i = 1; i < orgData.length; i++) {
                        if (orgData[i] && orgData[i].data && orgData[i].data.length) {
                            orgData[i].data.forEach(function(item) {
                                data.push(item);
                            });
                        }
                    }
                    return data;
                },
                renderFirstData(renderWidth, view, dataArr, font, color) {
                    this.renderDataView(renderWidth, view, dataArr, font, color, 0, false);
                },
                getEmoji(dataArr) {
                    var target = [];
                    dataArr.forEach(function(data) {
                        if (data.isText) {
                            var arr = global$9.parseEm(data.text);
                            target = target.concat(arr);
                            return;
                        }
                        target.push(data);
                    });
                    ArkWindow.console.warn('getEmoji', target);
                    return target;
                },
                isAllText(dataArr) {
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        if (!item.isText) {
                            return false;
                        }
                    }
                    return true;
                },
                getAllText(dataArr) {
                    var text = '';
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        text += item.text;
                    }
                    return text;
                },
                renderSecondData(renderWidth, view, dataArr, font, color) {
                    var fontSize = font || this.fontSize;
                    var dashWidth = this.measureText('...', fontSize);
                    var shouldAppend = this.renderDataView(renderWidth - dashWidth, view, dataArr, fontSize, color, 0, true);
                    if (dataArr.length && !shouldAppend) {
                        var textView = this.getTextView('...', fontSize, color, 0);
                        view.AddChild(textView);
                        return
                    }
                },
                renderDataView(renderWidth, view, dataArr, font, color, margin, setText) {
                    var width = renderWidth;
                    var targetFont = font || this.fontSize;
                    var marginStr = margin || 0;

                    var isAllText = false;

                    if (setText) {
                        isAllText = this.isAllText(dataArr);
                    }

                    if (isAllText) {
                        var newText = this.getAllText(dataArr);
                        var textView = this.getTextView(newText, targetFont, color, marginStr);
                        textView.SetStyle('emoji-feed-content-text-95');
                        view.AddChild(textView);
                        textView.SetEllipsis(true);
                        dataArr.splice(0, dataArr.length);
                        return;
                    }

                    while (dataArr.length && width >= 0) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {

                            // 有换行不处理哈
                            if (text == '\n') {
                                var emptyView = this.getEmptyView(width);
                                view.AddChild(emptyView);
                                width = 0;
                                return;
                            }
                            var textWidth = this.measureText(text, targetFont);
                            if (textWidth >= width) {
                                var maxRenderWidth = this.getMaxRenderLength(text, width, targetFont);
                                if (maxRenderWidth <= 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, targetFont, color, marginStr);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, targetFont, color, marginStr);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true, marginStr);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }

                        if (data.isLinkMember) {
                            if (text && text.length) {
                                if (text[0] === '@') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text, false, marginStr);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuild) {
                            if (text && text.length) {
                                if (text[0] === '*') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink(text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getGuildView(text, data.channelType);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            ArkWindow.console.warn('error', data, data.id);
                            var imageView = this.getEmojiView(data.url, data.id, marginStr);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }

                        if (data.isGroup) {
                            var linkWidth = this.measureLink(text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getGroupView(text, data.groupCode);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isTopic) {

                            if (text && text.length) {
                                if (text[0] === '#') {
                                    text = text.slice(1);
                                }
                            }
                            var linkWidth = this.measureLink('#' + text);

                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('#' + text, false, marginStr);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isEmpty && width > 2) {
                            var emptyView = this.getEmptyView(width);
                            view.AddChild(emptyView);
                            width = 0;
                            return true;
                        }
                    }
                },

                getGuildView(textStr, channelType) {
                    var linkView = this.generateView('guild', {
                        data: {
                            textStr,
                            channelType,
                        }
                    });
                    return linkView;
                },

                getGroupView(textStr, groupCode) {
                    var linkView = this.generateView('group', {
                        data: {
                            textStr: textStr,
                            groupCode: groupCode
                        }
                    });
                    return linkView;
                },

                getMaxRenderLength1(text, width, fontSize) {
                    var startLen = 0;
                    while (startLen <= text.length) {
                        var newStr = text.slice(0, startLen);
                        var newWidth = this.measureText(newStr, fontSize);

                        if (newWidth == width) {
                            return startLen;
                        }

                        if (newWidth > width) {
                            return startLen - 1;
                        }
                        startLen++;
                    }
                    return text.length;
                },

                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    ArkWindow.console.time('render count: ' + (c + 2));

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var textUI = this.measureTextUI;
                    if (!textUI) {
                        textUI = UI.Text();
                        this.measureTextUI = textUI;
                    }
                    textUI.SetValue(textStr);
                    textUI.SetFont(size);
                    var size = textUI.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 8
                },
                getEmojiView(url, id, margin) {
                    var imageView = UI.Image();
                    this.temViews.push(imageView);
                    imageView.SetValue(url);
                    var imageView = UI.Image();
                    this.temViews.push(imageView);
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji-95');
                    if (margin) {
                        imageView.SetStyle('emoji-margin-95');
                    }
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                        }
                    });
                },
                getEmptyView(width) {
                    var emptyView = UI.View();
                    this.temViews.push(emptyView);
                    var styleStr = 'display:flex;height:16;width:' + (width - 2);
                    emptyView.SetStyle(styleStr);
                    return emptyView;
                },
                getTextView(textStr, size, color, margin) {
                    var textView = UI.Text();
                    this.temViews.push(textView);
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    if (color) {
                        textView.SetTextColor(color);
                    } else {
                        textView.SetTextColor(0xFFA2A5AC);
                    }
                    if (margin) {
                        textView.SetStyle('feed-content-margin-95');
                    } else {
                        textView.SetStyle('feed-content-text-95');
                    }
                    return textView
                },
                getLinkView(textStr, img, margin) {
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: img,
                            margin: margin
                        }
                    });
                    return linkView;
                },
                setFeedTitle() {
                    var feedTitleStyleMap = {
                        color: {
                            light: 0xFF222222,
                            dark: 0xFFE8E9EA
                        },
                        size: 'size.17',
                    };
                    var font = feedTitleStyleMap.size;
                    var title = this.getTitle();
                    var renderWidth = this.view.GetSize().width;
                    var view = this.view.GetUIObject('feedTitleWrap');
                    this.refs.feedTitleWrap = view;
                    if (global$9.isAndroid()) {
                        view.SetStyle('feed-title-wrap-android-95');
                        font = 'size.17';
                    }
                    view.ClearChildren();
                    var dataArr = [{
                        isText: true,
                        text: title
                    }];
                    var config = this.colorConfig || ArkWindow.app.config;
                    var isDark = global$9.getDarkColorModel(config);
                    var color = feedTitleStyleMap.color.light;
                    if (isDark) {
                        color = feedTitleStyleMap.color.dark;
                    }

                    renderWidth = renderWidth - 26;

                    this.renderFirstData(renderWidth, view, dataArr, font, color);
                    this.renderSecondData(renderWidth, view, dataArr, font, color);
                },
                getTitle() {
                    var orgData = this.metaData.data.data;
                    if (orgData && orgData[0] && orgData[0].data && orgData[0].data[0] && orgData[0].data[0].text) {
                        return orgData[0].data[0].text;
                    }
                    return '';
                }
            }
        };
    })();

    var global$8 = ArkWindow;
    (function() {
        var appView = "header95";
        global$8[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "header");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    ArkWindow.console.time('header start Render');
                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.setViewValue(this.metaData.data);
                    this.colorConfig = ArkWindow.app.config;
                    this.setDarkModel();
                    if (global$8.isAndroid()) {
                        var publishView = this.view.GetUIObject('publish');
                        var headerTop = this.view.GetUIObject('headerRightTop');
                        var spaceView = this.view.GetUIObject('headerSpace');
                        this.refs.publishView = publishView;
                        this.refs.headerTop = headerTop;
                        this.refs.spaceView = spaceView;
                        headerTop.SetStyle('header-right-top-android-95');
                        publishView.SetFont('size.10');
                        spaceView.SetStyle('forum-space-android-95');
                        this.view.SetStyle('forum-header-wrap-android-95');
                    }                this.setHasEmoji();
                    ArkWindow.console.time('header start Render end');
                },
                setHasEmoji() {
                    var channelInfo = this.metaData.data.channel_info;
                    var channelName = channelInfo.channel_name;
                    var poster = this.metaData.data.poster;
                    var createTime = this.metaData.data.feed.create_time;

                    var channelName = channelInfo.channel_name;
                    var guildName = channelInfo.guild_name;
                    var nick = poster.nick;
                    var publishTimeStr = this.getCreateTimeStr(createTime);
                    var publishStr = nick + ' ' + publishTimeStr;
                    // 解决有emoji文字会被往下挤错位
                    if (global$8.hasEmoji(guildName)) {
                        // 标题包含emoji
                        var guildNameView = this.view.GetUIObject('guildName');
                        guildNameView.SetStyle('guild-name-has-emoji-95');
                        if (global$8.isAndroid()) {
                            headerRightTop.SetStyle('header-right-top-has-emoji-android-95');
                            guildNameView.SetStyle('guild-name-has-emoji-android-95');
                        }

                    }
                    if (global$8.hasEmoji(channelName)) {
                        var channelNameView = this.view.GetUIObject('channelName');
                        channelNameView.SetStyle('channel-name-has-emoji-95');
                        if (global$8.isAndroid()) {
                            channelNameView.SetStyle('channel-name-has-emoji-android-95');
                        }
                    }
                    if (global$8.hasEmoji(guildName) || global$8.hasEmoji(channelName) || global$8.hasEmoji(publishStr)) {
                        var publishView = this.view.GetUIObject('publish');
                        publishView.SetStyle('publish-has-emoji-95');
                        if (global$8.isAndroid()) {
                            publishView.SetStyle('publish-has-emoji-android-95');
                        }
                    }
                },
                setDarkModel() {
                    var colorMap = {
                        light: {
                            guildName: 0xFF222222,
                            channelName: 0xFF222222,
                            publish: 0xFFA2A5AC,
                        },
                        dark: {
                            guildName: 0xFFE8E9EA,
                            channelName: 0xFFE8E9EA,
                            publish: 0xFF838387
                        }
                    };
                    var config = this.colorConfig;
                    var isDark = global$8.getDarkColorModel(config);
                    var channelNameView = this.view.GetUIObject('channelName');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var publishView = this.view.GetUIObject('publish');
                    var spaceView = this.view.GetUIObject('headerSpace');
                    var targetTexture = spaceView.GetTexture('forumSpace');

                    ArkWindow.console.error('viewId', this.view.GetID());

                    this.refs.channelNameView = channelNameView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.publishView = publishView;
                    this.refs.newspaceView = spaceView;
                    this.refs.targetTexture = targetTexture;

                    if (isDark) {
                        ArkWindow.console.error('isDark' + isDark);
                        channelNameView.SetTextColor(colorMap.dark.channelName);
                        guildNameView.SetTextColor(colorMap.dark.guildName);
                        publishView.SetTextColor(colorMap.dark.publish);
                        targetTexture.SetValue(0xFF151516);
                        return
                    }
                    channelNameView.SetTextColor(colorMap.light.channelName);
                    guildNameView.SetTextColor(colorMap.light.guildName);
                    publishView.SetTextColor(colorMap.light.publish);
                    targetTexture.SetValue(0xFFD9D9DC);
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.setDarkModel();
                },
                setViewValue() {
                    var channelNameView = this.view.GetUIObject('channelName');
                    var guildNameView = this.view.GetUIObject('guildName');
                    var publishView = this.view.GetUIObject('publish');
                    var avatarView = this.view.GetUIObject('avatar');
                    var spaceView = this.view.GetUIObject('headerRightSpace');

                    this.refs.channelNameView = channelNameView;
                    this.refs.guildNameView = guildNameView;
                    this.refs.publishView = publishView;
                    this.refs.avatarView = avatarView;
                    this.refs.spaceView = spaceView;

                    var channelInfo = this.metaData.data.channel_info;
                    var poster = this.metaData.data.poster;
                    var createTime = this.metaData.data.feed.create_time;

                    var channelName = channelInfo.channel_name;
                    var guildName = channelInfo.guild_name;
                    var guildId = channelInfo.str_guild_id;
                    var nick = poster.nick;
                    var avatar = channelInfo.guild_icon || global$8.getAvatar(guildId);
                    var publishTimeStr = this.getCreateTimeStr(createTime);

                    var publishStr = nick + ' ' + publishTimeStr + '发布';

                    channelNameView.SetValue(channelName);
                    guildNameView.SetValue(guildName);
                    avatarView.SetValue(avatar);
                    publishView.SetValue(publishStr);

                    if (!guildName) {
                        spaceView.SetVisible(false);
                    }
                },
                getCreateTimeStr(time) {
                    if (!time) {
                        time = parseInt(Date.now() / 1000);
                    }
                    if (this.isSameDay(time * 1000)) {
                        return '今天';
                    }
                    if (this.isLastDay(time * 1000)) {
                        return '昨天';
                    }

                    var date = new Date(time * 1000);
                    var month = date.getMonth() + 1;
                    var day = date.getDate();
                    var year = date.getFullYear();
                    var monthStr = month >= 10 ? month : '0' + month;
                    var dayStr = day >= 10 ? day : '0' + day;
                    if (this.isSameYear(time * 1000)) {
                        return monthStr + '-' + dayStr;
                    }
                    return year + '-' + monthStr + '-' + dayStr;
                },
                isSameDay(createTime) {
                    var date = new Date();
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    var timeStamp = new Date(year + '/' + month + '/' + day).getTime();
                    var distanceTime = createTime - timeStamp;
                    return distanceTime < 24 * 60 * 60 * 1000 && distanceTime > 0;
                },
                isLastDay(createTime) {
                    var date = new Date();
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    var timeStamp = new Date(year + '/' + month + '/' + day).getTime();
                    var distanceTime = timeStamp - createTime;
                    return distanceTime < 24 * 60 * 60 * 1000 && distanceTime > 0;
                },
                isSameYear(createTime) {
                    var createYear = new Date().getFullYear();
                    var year = new Date(createTime).getFullYear();
                    return year === createYear;
                }
            }
        };
    })();

    var global$7 = ArkWindow;
    (function() {
        var appView = "record95";
        global$7[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "record");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.refs = {};
                    this.config = ArkWindow.app.config;
                    if (!this.metaData.data.isChannel) {
                        this.view.SetStyle('record-wrap-qun-95');
                    }
                    this.renderLinkView();
                },
                renderLinkView() {
                    var me = this;
                    var recordData = this.metaData.data;
                    var commentCount = recordData.commentCount;
                    var preferCount = recordData.preferCount;
                    var viewCount = recordData.viewCount;
                    var emojiCount = recordData.emojiCount;
                    var viewCountFirst = !(viewCount === '' || viewCount === undefined);
                    me.temViews = [];

                    var messageTextView = this.view.GetUIObject('messageText');
                    var recordImageView = this.view.GetUIObject('recordImage');
                    var textView = me.view.GetUIObject('recordImagesWrap');
                    this.refs.messageTextView = messageTextView;
                    this.refs.recordImageView = recordImageView;
                    this.refs.textView = textView;

                    // 兼容老版没有viewCount字段
                    if (!viewCountFirst) {
                        var emojiPics = recordData.emojiPics;
                        // 隐藏赞跟浏览字段
                        this.refs.messageTextView.SetStyle('record-message-wrap-AttributeName-none');

                        // 展示评论跟表情表态
                        this.refs.recordImageView.SetStyle('record-image-95');
                        this.refs.textView.SetStyle('record-images-wrap-95');

                        emojiPics.forEach(function(image) {

                            me.temViews.push(textView);
                            var id = image.emoji_id;
                            var type = image.emoji_type;
                            var src = global$7.getEmojiUrl(type, id);
                            var imageView = UI.Image();
                            me.temViews.push(imageView);
                            imageView.SetStyle('record-content-image-95');
                            imageView.SetValue(src);
                            imageView.SetStretch(2);
                            imageView.SetRadius(3, 3, 3, 3);

                            // gif 需要重试一试
                            if (src.slice(-3) === 'gif') {
                                me.attach(imageView, id, 0);
                            }
                            textView.AddChild(imageView);
                        }, this);
                    } else {
                        // 隐藏评论跟表情表态
                        this.refs.textView.SetStyle('record-images-wrap-95-none');
                        this.refs.recordImageView.SetStyle('record-image-95-none');

                        // 展示赞跟浏览字段
                        this.refs.messageTextView.SetStyle('record-message-wrap-AttributeName');

                        // linux 大字号渲染宽度偏小，增加2px兼容
                        const messageTextViewTextSize = this.refs.messageTextView.MeasureTextSize();
                        this.refs.messageTextView.SetStyle(`display:flex;width:${messageTextViewTextSize.width + 2};height:auto;marginRight:4`);
                    }


                    var messageCountView = this.view.GetUIObject('messageCount');
                    var emojiCountView = this.view.GetUIObject('emojiCount');

                    this.refs.messageCountView = messageCountView;
                    this.refs.emojiCountView = emojiCountView;

                    if (viewCountFirst) {
                        messageCountView.SetValue(this.transViewCountText(viewCount));
                    } else {
                        messageCountView.SetValue(commentCount);
                    }
                    if (viewCountFirst) {
                        emojiCountView.SetValue('赞  ' + this.transViewCountText(preferCount));
                    } else {
                        emojiCountView.SetValue(emojiCount);
                    }

                    this.setColorModel();

                },

                transViewCountText(viewCount) {
                    if (!viewCount) {
                        return '0';
                    }
                    let viewCountText = viewCount;
                    const viewCountNum = Number(viewCount);
                    if (viewCountNum > 9999 && viewCountNum <= 99999) {
                        viewCountText = (viewCountNum / 10000).toString().substring(0, 3) + '万+';
                    } else if (viewCountNum > 99999) {
                        viewCountText = '10万+';
                    }
                    return viewCountText
                },

                OnConfigChange(config) {
                    this.config = config;
                    this.setColorModel();
                },

                setColorModel() {
                    var config = this.config;
                    var isDark = global$7.getDarkColorModel(config);

                    var messageCountView = this.view.GetUIObject('messageCount');
                    var messageTextView = this.view.GetUIObject('messageText');
                    var emojiCountView = this.view.GetUIObject('emojiCount');

                    this.refs.messageCount = messageCountView;
                    this.refs.emojiCountView = emojiCountView;
                    this.refs.messageTextView = messageTextView;

                    if (isDark) {
                        messageCountView.SetTextColor(0xFF838387);
                        emojiCountView.SetTextColor(0xFF838387);
                        messageTextView.SetTextColor(0xFF838387);
                        return;
                    } else {
                        messageCountView.SetTextColor(0xFFA2A5AC);
                        emojiCountView.SetTextColor(0xFFA2A5AC);
                        messageTextView.SetTextColor(0xFFA2A5AC);
                    }
                },

                attach(image, id, time) {
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        image.GetValue();
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                            return;
                        }
                        var lastUrl = 'https://framework.cdn-go.cn/qqmoji/latest/sysface/static/s' + id + '.png';
                        image.SetValue(lastUrl);
                    });
                }
            }
        };
    })();

    var global$6 = ArkWindow;
    (function() {
        var appView = "comment95";
        global$6[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "comment");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    if (global$6.isAndroid()) {
                        var spaceView = this.view.GetUIObject('spaceView');
                        this.refs.spaceView = spaceView;
                        spaceView.SetStyle('comment-content-space-android-95');
                    }
                    this.views = [];
                    this.view.hasUpdate = true;
                    this.config = ArkWindow.app.config;
                    this.setColorModel();
                    this.renderView();
                },
                OnConfigChange(config) {
                    this.config = config;
                    this.UpdateRender();
                    this.setColorModel();
                },
                setColorModel() {
                    var config = this.config;
                    var isDark = global$6.getDarkColorModel(config);

                    var spaceView = this.view.GetUIObject('spaceView');
                    this.refs.spaceView = spaceView;
                    ArkWindow.console.error('viewId', this.view.GetID());
                    var targetTexture = spaceView.GetTexture('space');
                    this.refs.space = targetTexture;
                    if (isDark) {
                        targetTexture.SetValue(0xFF151516);
                        return
                    }
                    targetTexture.SetValue(0xFFD9D9DC);

                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$6[template] && global$6[template].ViewModel && global$6[template].ViewModel.New) {
                        var model = global$6[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                renderView() {
                    var data = this.metaData.data;
                    if (!data) {
                        return;
                    }
                    var me = this;
                    var len = data.length - 1;
                    data.forEach(function(comment, index) {
                        var commentItemView = me.generateView('commentItem95', {
                            data: {
                                comment: comment,
                                margin: index === len
                            }
                        });
                        var view = me.view;
                        view.AddChild(commentItemView);
                        me.views.push(commentItemView);
                    });
                },
                UpdateRender() {
                    if (!this.views) {
                        return;
                    }
                    ArkWindow.console.time('comment UpdateRender start');
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                    ArkWindow.console.time('comment UpdateRender end');
                }
            }
        };
    })();

    var global$5 = ArkWindow;
    (function() {
        var appView = "commentItem95";
        global$5[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "commentItem");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    if (global$5.isAndroid()) {
                        this.view.SetStyle('comment-item-wrap-android-95');
                    }

                    this.view.hasUpdate = true;
                    this.views = [];
                    this.colorConfig = ArkWindow.app.config;
                    this.renderView();
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$5[template] && global$5[template].ViewModel && global$5[template].ViewModel.New) {
                        var model = global$5[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                renderView() {
                    var nick = this.metaData.data.comment.post_user.nick + ':';
                    var desc = this.metaData.data.comment.rich_contents;
                    var margin = this.metaData.data.margin;
                    var nickView = this.view.GetUIObject('commentItemNick');
                    var descView = this.view.GetUIObject('commentItemRight');
                    this.refs.nickView = nickView;
                    this.refs.descView = descView;
                    var nickColor = 0xFF222222;
                    var config = this.colorConfig || ArkWindow.app.config;
                    var dark = global$5.getDarkColorModel(config);

                    if (dark) {
                        nickColor = 0xFFE8E9EA;
                    }
                    nickView.SetTextColor(nickColor);
                    nickView.SetValue(nick);

                    var emojiView = this.generateView('emoji95', {
                        data: {
                            maxLine: 1,
                            text: desc,
                            font: 'size.13'
                        }
                    });
                    descView.AddChild(emojiView);
                    if (margin) {
                        this.view.SetStyle("comment-item-wrap-no-margin-95");
                    }
                    this.views.push(emojiView);
                },
                UpdateRender() {
                    if (!this.views) {
                        ArkWindow.console.time('no views comment');
                        return;
                    }
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                }
            }
        };
    })();

    var global$4 = ArkWindow;
    (function() {
        var appView = "image95";
        global$4[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "image");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }

                    this.refs = {};
                    this.refsViews = [];
                    this.hasUpdate = true;
                },
                UpdateRender() {

                    ArkWindow.console.timeLog('images UpdateRender');
                    var images = this.metaData.data;
                    var len = images.length;
                    if (images.length && images.length >= 3) {
                        images = images.slice(0, 3);
                    }
                    len = images.length;

                    this.view.ClearChildren();

                    if (!len) {
                        this.view.SetVisible(false);
                    }

                    if (len === 1) {
                        this.setSingleImage95(images[0]);
                    }
                    if (len === 2) {
                        this.setDoubleImage95(images);
                    }
                    if (len >= 3) {
                        images = images.slice(0, 3);
                        this.setThirdImage95(images);
                    }
                },
                showUpdate(images) {
                    if (!this.oldData) {
                        return true;
                    }

                    var len = images.length;
                    var oldLen = this.oldData.length;
                    if (len !== oldLen) {
                        return true;
                    }
                    return JSON.stringify(images) === JSON.stringify(this.oldData);
                },

                resetHeight() {
                    var me = this;
                    var root = me.view.GetRoot();
                    var model = ArkWindow.app.GetModel(root);
                    model && model.resetHeight && model.resetHeight.call(model);
                },
                setSingleImage(image) {
                    var me = this;
                    var url = image.pic_url;
                    var requestTime = 3;
                    var wrap = this.view;
                    wrap.SetStyle('pro-feed-image-95');
                    wrap.Update();
                    var imgWrap = UI.View();
                    me.refs.imageWrap = imgWrap;
                    var rootSize = wrap.GetSize();
                    var orgWidth = rootSize.width;

                    var width = image.width;
                    var height = image.height;
                    var radio = (width / height) || (1188 / 501);

                    if (!width || !height) {
                        radio = 1;
                    }

                    var imgWrapWidth = orgWidth * 0.8;
                    var imgWrapHeight = orgWidth * 0.48;

                    if (radio >= 1) {
                        imgWrapWidth = orgWidth * 0.8;
                        imgWrapHeight = orgWidth * 0.48;
                    }

                    if (radio < 1) {
                        imgWrapWidth = orgWidth * 0.4;
                        imgWrapHeight = orgWidth * 0.52;
                    }

                    var rootWidth = imgWrapWidth;
                    var rootHeight = imgWrapHeight;
                    var rootRadio = rootWidth / rootHeight;
                    var texture = UI.Image();
                    me.refs.qunFeedImageTexture = texture;
                    if (rootRadio > radio) {
                        var width = rootWidth;
                        var height = rootWidth / radio;
                        var top = (height - rootHeight) / 2;
                        texture.SetSize(width, height);

                        ArkWindow.console.timeLog("imageStyle: width:" + width + ";height:" + height);

                        texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + width + ";height:" + height);
                    } else {
                        var width = rootHeight * radio;
                        var height = rootHeight;
                        var left = -1 * (width - rootWidth) / 2;
                        texture.SetSize(width, rootHeight);

                        ArkWindow.console.timeLog("imageStyle: width:" + width + ";height:" + height);

                        texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + width + ";height:" + height);
                    }
                    me.wrapHeight = imgWrapHeight;
                    imgWrap.SetStyle('display: flex;height:' + imgWrapHeight + ';width: ' + imgWrapWidth + ';position: relative');
                    imgWrap.SetRadius(6, 6, 6, 6);
                    imgWrap.AddChild(texture);

                    if (image.isVideo) {
                        var icon = me.createVideoIcon(rootWidth, rootHeight);
                        imgWrap.AddChild(icon);
                    }
                    imgWrap.Update();
                    me.view.AddChild(imgWrap);
                    me.view.Update();

                    this.cacheImage(url, requestTime, function(data) {
                        ArkWindow.console.warn('singleImage', data);
                        if (!data || !data.path) {
                            ArkWindow.console.warn('no imageData', url);
                            return;
                        }
                        if (texture) {
                            ArkWindow.console.error('texture', !!texture);
                            texture.SetValue(data.path);
                        }
                    });
                },
                setDoubleImage(images) {
                    var me = this;
                    var size = this.view.GetSize();
                    var width = size.width * 32.5 / 100;
                    var margin = size.width * 1.25 / 100;

                    me.wrapHeight = width;
                    me.temViewsArray = [];
                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;
                        if (index == 0) {
                            imageView.SetRadius(6, 0, 0, 6);
                        } else {
                            imageView.SetRadius(0, 6, 6, 0);
                        }
                        var styleStr = 'display:flex;position:relative;width:' + width + ';height:' + width + ';marginRight:' + margin;
                        imageView.SetStyle(styleStr);

                        if (!image) {
                            return;
                        }
                        var imgWidth = image.width;
                        var imgHeight = image.height;
                        var radio = (imgWidth / imgHeight);

                        if (!imgWidth || !imgHeight) {
                            radio = 1;
                        }

                        var rootWidth = width;
                        var rootHeight = width;
                        var rootRadio = rootWidth / rootHeight;
                        var texture = UI.Image();
                        me.temViewsArray.push(texture);
                        if (rootRadio > radio) {
                            var dataWidth = rootWidth;
                            var dataHeight = rootWidth / radio;
                            var top = (dataHeight - rootHeight) / 2;
                            ArkWindow.console.warn(dataWidth, dataHeight);

                            ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                            texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + dataWidth + ";height:" + dataHeight);
                        } else {
                            var dataWidth = rootHeight * radio;
                            var dataHeight = rootHeight;
                            var left = -1 * (dataWidth - rootWidth) / 2;
                            texture.SetSize(dataWidth, rootHeight);

                            ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                            texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + dataWidth + ";height:" + dataHeight);
                        }
                        var icon;
                        if (image.isVideo) {
                            icon = me.createVideoIcon(rootWidth, rootHeight);
                        }
                        me.view.AddChild(imageView);
                        imageView.AddChild(texture);

                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.warn('no imageData', url);
                                return;
                            }
                            var path = data.path;
                            if (icon) {
                                imageView.AddChild(icon);
                            }
                            ArkWindow.console.error('texture', !!texture);
                            if (texture) {
                                texture.SetValue(path);
                            }
                        });
                    });
                },
                setSingleImage95(image) {
                    var me = this;
                    var url = image.pic_url;
                    var requestTime = 3;
                    var wrap = this.view;
                    wrap.ClearChildren();
                    wrap.SetStyle('pro-feed-image-95');
                    wrap.Update();
                    var imgWrap = UI.View();
                    me.refs.imageWrap = imgWrap;
                    var rootSize = wrap.GetSize();
                    var orgWidth = rootSize.width;
                    var orgHeight = orgWidth * (684 / 910);
                    ArkWindow.console.warn('setSingleImage95', rootSize);
                    var width = image.width;
                    var height = image.height;
                    var radio = (width / height) || (1188 / 501);

                    if (!width || !height) {
                        radio = 1;
                    }
                    var imgWrapWidth = orgWidth;
                    var imgWrapHeight = orgHeight;

                    var rootWidth = imgWrapWidth;
                    var rootHeight = imgWrapHeight;
                    // var rootRadio = rootWidth / rootHeight;
                    var texture = UI.Image();
                    me.refs.qunFeedImageTexture = texture;
                    if (radio < 1) {
                        // 长图
                        var width = rootWidth;
                        var height = rootWidth / radio;
                        var top = (height - rootHeight) / 2;
                        texture.SetSize(width, height);

                        ArkWindow.console.timeLog("imageStyle: width:" + width + ";height:" + height);

                        texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + width + ";height:" + height);
                    } else {
                        var width = rootHeight * radio;
                        var height = rootHeight;
                        var left = -1 * (width - rootWidth) / 2;
                        texture.SetSize(width, rootHeight);

                        ArkWindow.console.timeLog("imageStyle: width:" + width + ";height:" + height);

                        texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + width + ";height:" + height);
                    }
                    me.wrapHeight = imgWrapHeight;
                    imgWrap.SetStyle('display: flex;height:' + imgWrapHeight + ';width: ' + imgWrapWidth + ';position: relative');
                    imgWrap.SetRadius(0, 0, 0, 0);
                    imgWrap.AddChild(texture);

                    if (image.isVideo) {
                        var icon = me.createVideoIcon(rootWidth, rootHeight);
                        imgWrap.AddChild(icon);
                    }
                    imgWrap.Update();
                    me.view.AddChild(imgWrap);
                    me.view.Update();

                    this.cacheImage(url, requestTime, function(data) {
                        ArkWindow.console.warn('singleImage', data);
                        if (!data || !data.path) {
                            ArkWindow.console.warn('no imageData', url);
                            return;
                        }
                        if (texture) {
                            ArkWindow.console.error('texture', !!texture);
                            texture.SetValue(data.path);
                        }
                    });
                },
                setDoubleImage95(images) {
                    var me = this;
                    var size = this.view.GetSize();
                    var width = size.width * 49.8 / 100;
                    var height = width * (684 / 910) * 2;
                    var margin = size.width * 0.2 / 100;
                    me.view.ClearChildren();
                    me.wrapHeight = width;
                    me.temViewsArray = [];
                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;

                        imageView.SetRadius(0, 0, 0, 0);

                        var styleStr = 'display:flex;position:relative;width:' + width + ';height:' + height + ';marginRight:' + margin;
                        imageView.SetStyle(styleStr);

                        if (!image) {
                            return;
                        }
                        var texture = UI.Image();
                        me.temViewsArray.push(texture);

                        texture.SetStyle("display:flex;width:100%;height:auto;");
                        texture.SetMode('aspectfill');

                        var icon;
                        if (image.isVideo) {
                            icon = me.createVideoIcon(width, height);
                        }
                        me.view.AddChild(imageView);
                        imageView.AddChild(texture);

                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.warn('no imageData', url);
                                return;
                            }
                            var path = data.path;
                            if (icon) {
                                imageView.AddChild(icon);
                            }
                            ArkWindow.console.error('texture', !!texture);
                            if (texture) {
                                texture.SetValue(path);
                            }
                        });
                    });
                },
                setThirdImage95(images, extraLen) {
                    var me = this;
                    var size = this.view.GetSize();
                    var width = size.width * 49.8 / 100;
                    var height = width * (684 / 910) * 2;
                    var margin = size.width * 0.2 / 100;
                    // me.view.ClearChildren();
                    me.wrapHeight = width;
                    me.view.SetStyle('image-wrap-three-95');
                    me.texturesRefs = [];
                    me.viewImgRefs = [];
                    me.temViewsArray = [];
                    // 右侧view
                    var rightView = UI.View();
                    var rightViewStyle = 'display:flex;flexDirection:column;position:relative;width:' + Math.ceil(width) + ';height:' + Math.ceil(height) + ';marginRight:' + margin;
                    rightView.SetStyle(rightViewStyle);
                    this.view.AddChild(rightView);
                    images.forEach(function(image, index) {
                        var imageView = UI.View();
                        me.temViewsArray.push(imageView);
                        var url = image.pic_url;
                        var requestTime = 3;
                        ArkWindow.console.warn('mages.forEach', String(index));
                        imageView.SetRadius(0, 0, 0, 0);

                        var styleStr = 'display:flex;position:relative;width:' + Math.ceil(width) + ';height:' + Math.ceil(height) + ';marginRight:' + margin;
                        if (index === 2) {
                            styleStr += ';marginTop:0.5';
                        }
                        imageView.SetStyle(styleStr);
                        if (index === 1 || index === 2) {
                            rightView.AddChild(imageView);
                            rightView.Update();
                        } else {
                            me.view.AddChild(imageView);
                        }
                        me.view.Update();

                        me.view.SetSize(size.width, Math.ceil(width));
                        if (!image) {
                            return;
                        }

                        var texture = UI.Image();
                        me.temViewsArray.push(texture);
                        me.refs.qunFeedImageTexture = texture;
                        ArkWindow.console.timeLog('aaa view width width', width);
                        ArkWindow.console.timeLog('aaa view width height', height);

                        texture.SetSize(width, height);

                        texture.SetStyle("display:flex;width:100%;height:auto");
                        texture.SetMode('aspectfill');
                        var icon;
                        if (image.isVideo) {
                            icon = me.createVideoIcon(width, height);
                        }

                        imageView.AddChild(texture);
                        imageView.Update();

                        // imageView需在挂载后添加
                        if (index == 2 && extraLen > 0) {
                            var extraLenView = me.createExtraView(extraLen, Math.ceil(width), Math.ceil(width));
                            if (extraLenView && imageView) {
                                imageView.AddChild(extraLenView);
                            }
                        }

                        me.texturesRefs.push(texture);
                        me.viewImgRefs.push(imageView);

                        me.cacheImage(url, requestTime, function(data) {
                            if (!data || !data.path) {
                                ArkWindow.console.timeLog('no imageData', url);
                                return;
                            }
                            var texture = me.texturesRefs[index];
                            var imageView = me.viewImgRefs[index];
                            var path = data.path;
                            if (icon && imageView) {
                                imageView.AddChild(icon);
                            }
                            ArkWindow.console.error('texture', !!texture);
                            if (texture) {
                                texture.SetValue(path);
                            } else {
                                ArkWindow.console.error(me.texturesRefs[index], index, me.texturesRefs);
                            }
                        });
                    });
                },
                createExtraView(extraLen, imgWidth, imgHeight) {
                    var view = this.generateView('extraLen', {
                        data: {
                            extraLen: extraLen,
                            parentWidth: imgWidth,
                            parentHeight: imgHeight
                        }
                    });
                    return view;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$4[template] && global$4[template].ViewModel && global$4[template].ViewModel.New) {
                        var model = global$4[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                createVideoIcon(width, height) {
                    var view = UI.View();
                    var image = UI.Image();
                    this.refsViews.push(view);
                    this.refsViews.push(image);
                    view.SetStyle('video-icon-wrap');
                    image.SetStyle('video-icon');
                    image.SetValue('images/btn_play.png');
                    this.clipImage(view, width, height);
                    view.AddChild(image);
                    return view;
                },
                clipImage: function(view, rootWidth, rootHeight) {
                    var me = this;
                    var radio = 1;
                    var rootRadio = rootWidth / rootHeight;
                    var texture = UI.Image();
                    me.refsViews.push(texture);
                    me.refs.qunFeedImageMask = texture;
                    if (rootRadio > radio) {
                        var dataWidth = rootWidth;
                        var dataHeight = rootWidth / radio;
                        var top = (dataHeight - rootHeight) / 2;

                        ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                        texture.SetStyle("position:absolute;top: -" + top + ";left:0;width:" + dataWidth + ";height:" + dataHeight);
                    } else {
                        var dataWidth = rootHeight * radio;
                        var dataHeight = rootHeight;
                        var left = -1 * (dataWidth - rootWidth) / 2;
                        texture.SetSize(dataWidth, rootHeight);

                        ArkWindow.console.timeLog("imageStyle: width:" + dataWidth + ";height:" + dataHeight);

                        texture.SetStyle("position:absolute;top: 0;bottom:0;left:" + left + ";width:" + dataWidth + ";height:" + dataHeight);
                    }
                    ArkWindow.console.error('images/mask.png', !!texture);
                    if (texture) {
                        texture.SetValue('images/mask.png');
                    }
                    view.AddChild(texture);
                },
                cacheImage(imageUrl, requestTime, callback) {
                    var data = arkWeb.Storage.Load(imageUrl);
                    var me = this;
                    if (data && data.width && data.height) {
                        ArkWindow.console.warn('cachedImage', imageUrl);
                        return callback(data);
                    }

                    ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                        if (err) {
                            ArkWindow.console.warn(imageUrl + ' OnError', err);
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        }

                        var img = UI.Image();
                        me.refsViews.push(img);
                        img.AttachEvent("OnError", function(sender) {
                            ArkWindow.console.warn(imageUrl, ' OnError');
                            if (requestTime <= 0) {
                                return;
                            }
                            requestTime--;
                            me.cacheImage(imageUrl, requestTime, callback);
                            return;
                        });

                        img.AttachEvent("OnLoad", function(sender) {
                            ArkWindow.console.log(imageUrl + ' OnLoad');

                            var size = sender.GetSize();
                            ArkWindow.console.log('width: ' + size.width + ' height: ' + size.height);

                            arkWeb.Storage.Save(imageUrl, {
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                            callback({
                                path: path,
                                width: size.width,
                                height: size.height
                            });
                        });

                        img.SetValue(path);
                    });
                },

            }
        };
    })();

    var global$3 = ArkWindow;
    (function() {
        var appView = "emoji95";
        global$3[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + "text");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log(appView + " Deinitialize");
                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.log(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue");
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.log(appView + " Update");

                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.log(appView + " metaData invaild");
                        return
                    }
                    this.colorConfig = ArkWindow.app.config;
                    this.refs = {};
                    this.savaViews = [];
                    this.fontSize = 'size.12';
                },
                OnConfigChange(config) {
                    this.colorConfig = config;
                    this.hasUpdateRender = false;
                    this.UpdateRender();
                },
                // resetHeight 做增量渲染。
                UpdateRender() {
                    if (this.hasUpdateRender) {
                        return;
                    }
                    ArkWindow.console.time('emoji UpdateRender start');
                    this.hasUpdateRender = true;
                    var view = this.view.GetUIObject('emojiFeedContent');
                    this.refs.emojiFeedContent = view;
                    view.ClearChildren();
                    var renderWidth = this.view.GetSize().width;
                    var dataArr = this.getRenderData();
                    var maxLen = this.metaData.data.maxLine;
                    this.fontSize = this.metaData.data.font || this.fontSize;
                    this.renderEmojiView(renderWidth, view, dataArr, maxLen);
                    ArkWindow.console.time('emoji UpdateRender end');
                },
                getRenderData() {
                    var orgData = this.metaData.data.text;
                    var root = this.view.GetRoot();
                    var rootModel = ArkWindow.app.GetModel(root);
                    var guildId = '';
                    if (rootModel && rootModel.metaData && rootModel.metaData.detail && rootModel.metaData.detail.channel_info) {
                        guildId = rootModel.metaData.detail.channel_info.str_guild_id;
                    }
                    return global$3.parseFeedComment(orgData, guildId);
                },
                renderEmojiView(renderWidth, view, dataArr, maxLen) {
                    view.ClearChildren();
                    var size = this.fontSize;
                    var dashWidth = this.measureText('...', size);

                    var textColor = 0xFFA2A5AC;
                    var config = this.colorConfig || ArkWindow.app.config;
                    var dark = global$3.getDarkColorModel(config);
                    if (dark) {
                        textColor = 0xFF838387;
                    }

                    for (var i = 0; i < maxLen; i++) {
                        // 没数据了
                        if (!dataArr.length) {
                            return;
                        }
                        if (i != maxLen - 1) {
                            this.renderDataView(renderWidth, view, dataArr, size, textColor);
                        } else {
                            this.renderDataView(renderWidth - dashWidth, view, dataArr, size, textColor);
                        }

                        //还有剩就追加...
                        if (dataArr.length && i == maxLen - 1) {
                            var textView = this.getTextView('...', this.fontSize, textColor);
                            view.AddChild(textView);
                            return;
                        }

                    }
                },
                isAllText(dataArr) {
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        if (!item.isText) {
                            return false;
                        }
                    }
                    return true;
                },
                getAllText(dataArr) {
                    var text = '';
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i];
                        text += item.text;
                    }
                    return text;
                },
                renderDataView(renderWidth, view, dataArr, size, color) {
                    var width = renderWidth;
                    var renderSize = size || this.fontSize;

                    var isAllText = this.isAllText(dataArr);

                    if (isAllText) {
                        var newText = this.getAllText(dataArr);
                        var textView = this.getTextView(newText, renderSize, color);
                        textView.SetStyle('emoji-feed-content-text-95');
                        view.AddChild(textView);
                        textView.SetEllipsis(true);
                        dataArr.splice(0, dataArr.length);
                        return;
                    }

                    while (dataArr.length) {
                        var data = dataArr.shift();
                        if (!data) {
                            return;
                        }
                        var text = data.text;
                        if (data.isText) {
                            var textWidth = this.measureText(text, renderSize);
                            if (textWidth >= width) {
                                var maxRenderWidth = this.getMaxRenderLength(text, width, renderSize);
                                if (maxRenderWidth <= 0) {
                                    dataArr.unshift(data);
                                    return;
                                }
                                var newText = text.slice(0, maxRenderWidth);
                                var textView = this.getTextView(newText, renderSize, color);
                                view.AddChild(textView);
                                dataArr.unshift({
                                    isText: true,
                                    text: text.slice(maxRenderWidth)
                                });
                                return;
                            } else {
                                var textView = this.getTextView(text, renderSize, color);
                                view.AddChild(textView);
                                width = width - textWidth;
                            }
                        }

                        if (data.isUrl) {
                            var urlWidth = this.measureLink(text) + 16;
                            if (urlWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var urlView = this.getLinkView(text, true);
                            view.AddChild(urlView);
                            width = width - urlWidth;
                        }
                        if (data.isLinkMember) {
                            var linkWidth = this.measureLink('@' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView('@' + text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }

                        if (data.isLinkGuilld) {
                            var linkWidth = this.measureLink('#' + text);
                            if (linkWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var linkView = this.getLinkView(text);
                            view.AddChild(linkView);
                            width = width - linkWidth;
                        }
                        if (data.isImage) {
                            var imageWidth = this.measureEmoji();
                            if (imageWidth > width) {
                                dataArr.unshift(data);
                                return;
                            }
                            var imageView = this.getEmojiView(data.url, data.id);
                            view.AddChild(imageView);
                            width = width - imageWidth;
                        }
                    }
                },
                getMaxRenderLength(text, width, fontSize) {
                    var mid;
                    var l = 0;
                    var r = text.length;
                    var c = 0;
                    // 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
                    while (r - l > 1) {
                        mid = Math.floor((l + r) / 2);
                        // 如果目标数比中间小，所以范围在左边
                        var newStr = text.slice(0, mid);
                        var newWidth = this.measureText(newStr, fontSize);
                        c++;
                        if (width < newWidth) {
                            r = mid;
                        } else {
                            l = mid;
                        }                }
                    ArkWindow.console.time('render count: ' + (c + 2));

                    var newStrL = text.slice(0, l);
                    var newWidthL = this.measureText(newStrL, fontSize);

                    var newStrR = text.slice(0, r);
                    var newWidthR = this.measureText(newStrR, fontSize);

                    ArkWindow.console.time('render str: ' + newStrL + 'width: ' + newWidthL);
                    ArkWindow.console.time('render str: ' + newStrR + 'width: ' + newWidthR);

                    if (newWidthL === width) {
                        return l;
                    }

                    if (newWidthR === width) {
                        return r;
                    }

                    return l;
                },
                measureText(textStr, size) {
                    var text = this.measureTextUI;
                    if (!text) {
                        this.measureTextUI = UI.Text();
                        text = this.measureTextUI;
                    }
                    text.SetValue(textStr);
                    text.SetFont(size);
                    var size = text.GetSize();
                    return size.width;
                },
                measureEmoji() {
                    return 16;
                },
                measureLink(text) {
                    return this.measureText(text, 'size.12') + 8
                },
                getEmojiView(url, id) {
                    var imageView = UI.Image();
                    this.savaViews.push(imageView);
                    var imgUrl = url;
                    if (!imgUrl && id) {
                        var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                        imgUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    }
                    imageView.SetValue(imgUrl);
                    if (imgUrl && imgUrl.slice(-3) == 'gif') {
                        this.attach(imageView, id, 0);
                    }
                    imageView.SetStyle('emoji-95');
                    imageView.SetStretch(2);
                    return imageView;
                },
                attach(image, id, time) {
                    ArkWindow.console.warn('id', id);
                    var cdnUrlPrefix = 'https://framework.cdn-go.cn/qqmoji/latest';
                    var apngUrl = cdnUrlPrefix + '/sysface/apng/s' + id + '.png';
                    var pngUrl = cdnUrlPrefix + '/sysface/static/s' + id + '.png';
                    image.AttachEvent("OnError", function(sender) {
                        var value = image.GetValue();
                        ArkWindow.console.warn(value + ' OnError');
                        if (time === 0) {
                            image.SetValue(apngUrl);
                            time++;
                            return;
                        }
                        if (time === 1) {
                            image.SetValue(pngUrl);
                            time++;
                            return;
                        }
                        var lastUrl = 'https://framework.cdn-go.cn/qqmoji/latest/sysface/static/s' + id + '.png';
                        image.SetValue(lastUrl);
                    });
                },
                getTextView(textStr, size, color) {
                    var textView = UI.Text();
                    this.savaViews.push(textView);
                    textView.SetValue(textStr);
                    textView.SetFont(size);
                    var colorStr = color || 0xFF333333;
                    textView.SetTextColor(colorStr);
                    return textView
                },
                getLinkView(textStr) {
                    var linkView = this.generateView('link', {
                        data: {
                            textStr: textStr,
                            img: false,
                        }
                    });
                    return linkView;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$3[template] && global$3[template].ViewModel && global$3[template].ViewModel.New) {
                        var model = global$3[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
            }
        };
    })();

    var global$2 = ArkWindow;
    (function() {
        var appView = "extraLen";
        global$2[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.timeLog(appView + "extraLen");
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.timeLog(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.timeLog(appView + " Deinitialize");
                },
                OnResize: function() {
                    ArkWindow.console.timeLog(appView + " OnResize");
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.warn(appView + "OnSetValue", value);
                    this.metaData = value || this.metaData;
                    this.refs = {};
                    this.Update();
                },
                Update: function() {
                    ArkWindow.console.timeLog(appView + " Update");
                    if (this.view.hasUpdate) {
                        return
                    }

                    if (!this.metaData.data) {
                        ArkWindow.console.timeLog(appView + " metaData invaild");
                        return
                    }

                    this.view.hasUpdate = true;
                    this.renderExtraLenView();
                },
                renderExtraLenView() {
                    var extraLen = this.metaData.data.extraLen;
                    var parentWidth = this.metaData.data.parentWidth;
                    var parentHeight = this.metaData.data.parentHeight;

                    var textView = this.view.GetUIObject('extraLenText');
                    var extraLenWrapContentView = this.view.GetUIObject('extraLenWrapContent');
                    this.refs.textView = textView;
                    textView.SetValue('+' + extraLen);
                    var extraLenStrLen = 24;
                    var sizeHeight = 17;
                    if (String(extraLen).length === 1) {
                        extraLenStrLen = 24;
                    }
                    if (String(extraLen).length === 2) {
                        extraLenWrapContentView.SetStyle('extra-len-wrap-content-2');
                        extraLenStrLen = 30;
                    }
                    if (String(extraLen).length === 3) {
                        extraLenWrapContentView.SetStyle('extra-len-wrap-content-3');
                        extraLenStrLen = 36;
                    }
                    var posX = extraLenStrLen - parentWidth;

                    var posY = sizeHeight - parentHeight;
                    this.view.SetRelativePos(posX, posY);

                }
            }
        };
    })();

    var global$1 = ArkWindow;
    (function() {
        var appView = "baseView";
        global$1[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    ArkWindow.console.log(appView + " New");
                    var model = Object.create(this);
                    model.Initialize(view);
                    // 特殊处理一下model。
                    global$1.parentModel = model;
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log(appView + " Initialize");
                    this.view = view;
                    // 兜底数据
                    this.metaData = {};
                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.warn(appView + " Deinitialize");

                    if (this.views) {
                        this.views.forEach(function(view) {
                            var model = ArkWindow.app.GetModel(view);
                            if (model && model.Deinitialize) {
                                model.Deinitialize(view);
                                ArkWindow.app.deleteViewModel(view);
                            }
                        });
                    }
                },
                OnResize: function() {
                    ArkWindow.console.warn(appView + " OnResize");
                    if (this.shouldReset) {
                        ArkWindow.console.time('shouldReset');
                        this.resetHeight(false);
                        this.shouldReset = false;
                    }
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    this.metaData = value || this.metaData;
                    this.Update();
                },
                consoleTime(key) {
                    var feed = this.metaData.detail.feed;
                    var title = '';
                    if (feed && feed.title && feed.title.contents && feed.title.contents.length && feed.title.contents[0].text_content && feed.title.contents[0].text_content.text) {
                        title = feed.title.contents[0].text_content.text;
                    }
                    var startTime = this.consoleStartTime;
                    if (!startTime) {
                        this.consoleStartTime = Date.now();
                        startTime = this.consoleStartTime;
                    }
                    var endTime = Date.now() - startTime;
                    ArkWindow.console.time('baseView-->' + title + ': ' + key, endTime);
                },
                Update: function() {

                    if (!this.metaData.detail) {
                        return;
                    }

                    if (this.view.hasUpdate) {
                        return
                    }

                    this.view.hasUpdate = true;
                    var tagType = this.metaData.detail.tag_type;
                    if (tagType === 1) {
                        this.generateViews95();
                        return;
                    }
                    this.views = [];
                    var isChannel = global$1.isChannel.call(this);
                    var isPreview = global$1.isPreview.call(this);
                    var detail = this.metaData.detail;
                    detail.isChannel = isChannel;
                    detail.isPreview = isPreview;
                    this.consoleTime('isPreview:' + isPreview + 'isChannel:' + isChannel);
                    // 有数据直接渲染
                    if (isChannel) {
                        this.consoleTime('generateView qunpro');
                        var channelView = this.generateView('qunpro', {
                            detail: detail,
                        });
                        this.views.push(channelView);
                        this.view.AddChild(channelView);
                        this.view.Update();
                        this.resetWidth();
                        this.view.Update();
                        this.UpdateRender();
                        this.view.Update();
                        this.resetHeight();
                        this.view.Update();
                        this.shouldReset = true;
                        this.consoleTime('init render end');
                        this.reportDatong();
                        return;
                    }
                    if (isPreview) {
                        this.generateViews95();
                        return;
                    }
                    this.consoleTime('render qun start');

                    var qunView = this.generateView('qun', {
                        detail: detail,
                    });
                    this.views.push(qunView);
                    this.view.AddChild(qunView);
                    this.view.Update();
                    this.resetWidth();
                    this.UpdateRender();
                    this.resetHeight();
                    this.view.Update();
                    this.reportAioDatong();
                    this.consoleTime('render end');
                },
                generateViews95() {
                    this.views = [];
                    var isChannel = global$1.isChannel.call(this);
                    var isPreview = global$1.isPreview.call(this);
                    var detail = this.metaData.detail;
                    detail.isChannel = isChannel;
                    detail.isPreview = isPreview;
                    // var hasFeed = this.hasAllFeed();
                    this.consoleTime('isPreview:' + isPreview + 'isChannel:' + isChannel);
                    // 有数据直接渲染
                    if (isChannel) {
                        this.consoleTime('generateView qunpro95');
                        var channelView = this.generateView('qunpro95', {
                            detail: detail,
                        });
                        this.views.push(channelView);
                        this.view.AddChild(channelView);
                        this.view.Update();
                        this.resetWidth();
                        this.view.Update();
                        this.UpdateRender();
                        this.view.Update();
                        this.resetHeight();
                        this.view.Update();
                        this.shouldReset = true;
                        this.consoleTime('init render end');
                        this.reportDatong();
                        return;
                    }

                    this.consoleTime('render qun95 start');

                    var qunView = this.generateView('qun95', {
                        detail: detail,
                    });
                    this.views.push(qunView);
                    this.view.AddChild(qunView);
                    this.view.Update();
                    this.resetWidth();
                    this.UpdateRender();
                    this.resetHeight();
                    this.view.Update();
                    this.reportAioDatong();
                    this.consoleTime('render end');
                },
                reportAioDatong() {
                    ArkWindow.console.warn('initDatong');
                    var channelInfo = this.metaData.detail.channel_info;
                    var channelId = channelInfo.str_guild_id;
                    var source = this.getSource();
                    var subChannelId = channelInfo.channel_id;
                    var channelName = channelInfo.channel_name || '';

                    this.consoleTime('source: ' + source);
                    this.consoleTime('channelId: ' + channelId);

                    var udfKv = {
                        cur_pg: {
                            ref_pg: {},
                            ref_ele: {},
                            pgid: '',
                        },
                        sgrp_share_ark_source: source + '',
                        sgrp_channel_id: channelId,
                        sgrp_sub_channel_id: subChannelId,
                        sgrp_sub_channel_name: global$1.replaceAllEmoji(channelName),
                        sgrp_ark_type: 1, // 1-新样式
                    };

                    var beacon = new ArkWindow.BeaconAction({
                        appKey: '0WEB04SGH543EALS',
                        pageId: '',
                        appVersion: ArkWindow.appVersion(),
                        udfKv: JSON.stringify(udfKv)
                    });

                    this.beaconStartTime = Date.now();
                    beacon.onDirectUserAction('ev_sgrp_share_forum_ark_imp', {
                        A99: 'N',
                    });
                    this.beacon = beacon;
                },
                getSource() {
                    // { "1": "C2C", "2": "群", "3": "频道", "4": "ark预览", "5": "公众平台信息", "6": "其他" }
                    var containerType = this.getContainerType();
                    var reportMap = {
                        '-1': 4,
                        '1': 5,
                        '2': 1,
                        '3': 2,
                        '4': 2,
                        '5': 2,
                        '6': 2,
                        '7': 3,
                    };
                    return reportMap[containerType] || 6;
                },
                getContainerType() {
                    //返回视图所在会话的类型（1、公众平台消息，2、普通的好友消息，3、群会话，4、讨论组，5、群临时会话，6、讨论组临时会话，7、 频道会话，-1、其他会话）
                    var view = this.view;
                    var rootView = view.GetRoot();
                    var containerInfo = {
                        ChatType: -1
                    };
                    if (typeof QQ.GetContainerInfo === 'function') {
                        var containerInfoTemp = QQ.GetContainerInfo(rootView);
                        if (containerInfoTemp.ChatType !== undefined) {
                            containerInfo = containerInfoTemp;
                        }
                    }
                    var chatType = containerInfo.ChatType;
                    return chatType;
                },
                reportClickDatong() {

                    this.beacon.onDirectUserAction('ev_sgrp_share_forum_ark_clk', {
                        A99: 'N',
                    });
                },
                reportDatong() {
                    var channelInfo = this.metaData.detail.channel_info;
                    var guildId = channelInfo.str_guild_id;
                    var channelId = channelInfo.channel_id;
                    ArkWindow.console.error('channelId', channelId, 'guildId', guildId);
                    var udfKv = {
                        cur_pg: {
                            ref_pg: {},
                            ref_ele: {},
                            pgid: 'pg_sgrp_aio',
                            sgrp_sub_channel_type: '5',
                            sgrp_sub_channel_id: channelId,
                            sgrp_channel_id: guildId,
                        },
                        eid: 'em_sgrp_aio_forumark_exposure'
                    };

                    var beacon = new ArkWindow.BeaconAction({
                        appKey: '0WEB04SGH543EALS',
                        pageId: 'pg_sgrp_aio',
                        appVersion: ArkWindow.appVersion(),
                        udfKv: JSON.stringify(udfKv)
                    });

                    this.beaconStartTime = Date.now();
                    beacon.onDirectUserAction('dt_imp', {
                        A99: 'N',
                        dt_eid: "em_sgrp_aio_forumark_exposure",
                    });
                    this.beacon = beacon;
                },
                generateView(template, data) {
                    var view = CreateView(template);
                    this.newModel(view, template);
                    view.SetMetadata(data);
                    return view;
                },
                newModel(view, template) {
                    var viewRoot = view.GetRoot();
                    if (global$1[template] && global$1[template].ViewModel && global$1[template].ViewModel.New) {
                        var model = global$1[template].ViewModel.New(viewRoot);
                        ArkWindow.app.viewModels.set(view, model);
                    }
                },
                resetWidth() {
                    var root = this.view.GetRoot();
                    var size = root.GetSize();
                    var screenWidth = arkWeb.Device && arkWeb.Device.GetScreenWidth();
                    var widthRate = 789 / 1284;
                    var maxWidth = widthRate * screenWidth;
                    ArkWindow.console.error('qunAio', maxWidth);
                    if (global$1.isChannel.call(this)) {
                        widthRate = 1044 / 1284;
                        maxWidth = widthRate * screenWidth;
                        ArkWindow.console.error('channel', maxWidth);
                    }

                    if (global$1.isPreview.call(this)) {
                        maxWidth = size.width;
                    }

                    if (size.width < maxWidth) {
                        maxWidth = size.width;
                    }

                    if (!global$1.isPreview.call(this) && !global$1.isChannel.call(this)) {
                        maxWidth = size.width;
                    }

                    var trueWidth = maxWidth;

                    // ios 频道单独处理
                    if (!global$1.isAndroid() && global$1.isChannel.call(this)) {
                        trueWidth = size.width;
                    }

                    var styleStr = "display:flex;maxHeight:3000;flexDirection:column;padding:0;minHeight:50;height:auto;width:" + trueWidth;
                    root.SetStyle(styleStr);
                    root.Update();
                    ArkWindow.console.error('resetWidth: ', trueWidth);
                    return;
                },
                resetHeight(cache, height) {
                    var root = this.view.GetRoot();
                    var size = root.GetSize();
                    var screenWidth = arkWeb.Device && arkWeb.Device.GetScreenWidth();
                    var widthRate = 789 / 1284;
                    var maxWidth = widthRate * screenWidth;
                    ArkWindow.console.error('qunAio', maxWidth);
                    if (global$1.isChannel.call(this)) {
                        widthRate = 1044 / 1284;
                        maxWidth = widthRate * screenWidth;
                        ArkWindow.console.error('channel', maxWidth);
                    }

                    if (global$1.isPreview.call(this)) {
                        maxWidth = size.width;
                    }
                    if (size.width < maxWidth) {
                        maxWidth = size.width;
                    }

                    if (!global$1.isPreview.call(this) && !global$1.isChannel.call(this)) {
                        maxWidth = size.width;
                    }

                    var trueWidth = maxWidth;

                    // ios 频道单独处理
                    if (!global$1.isAndroid() && global$1.isChannel.call(this)) {
                        trueWidth = size.width;
                        this.consoleTime('size.width: ' + trueWidth);
                    }

                    this.consoleTime('size.width: ' + trueWidth);

                    var styleStr = "display:flex;maxHeight:3000;minHeight:50;flexDirection:column;padding:0;height:auto;width:" + trueWidth;
                    root.SetStyle(styleStr);
                    root.Update();

                    var newSize = root.GetSize();
                    var lastHeight = newSize.height || 320;

                    var newStyleStr = "display:flex;maxHeight:3000;minHeight:50;flexDirection:column;padding:0;height:" + lastHeight + ";width:" + trueWidth;
                    root.SetStyle(newStyleStr);
                    root.Update();

                    var printSize = root.GetSize();
                    this.consoleTime('resetHeight: ' + JSON.stringify(printSize, null, 2));

                    if (!printSize.height) {
                        var newStyleStr = "display:flex;maxHeight:3000;minHeight:50;flexDirection:column;padding:0;height:auto;width:" + trueWidth;
                        root.SetStyle(newStyleStr);
                        root.Update();
                    }

                },

                hasAllFeed() {
                    var feed = this.metaData.detail.feed;
                    return feed.contents;
                },

                UpdateRender() {
                    if (!this.views) {
                        return;
                    }
                    this.view.Update();
                    this.views.forEach(function(view) {
                        ArkWindow.app.UpdateRender(view);
                    });
                },
                onClick() {
                    var isChannel = global$1.isChannel.call(this);

                    if (!isChannel) {
                        this.reportClickDatong();
                        return;
                    }
                    this.reportChannel();
                },
                reportChannel() {
                    var beaconStartTime = this.beaconStartTime;
                    this.beacon.onDirectUserAction('dt_clck', {
                        dt_eid: "em_sgrp_aio_forumark_exposure",
                        A99: 'N',
                    });

                    this.beacon.onDirectUserAction('dt_imp_end', {
                        dt_eid: "em_sgrp_aio_forumark_exposure",
                        dt_lvtm: Date.now() - beaconStartTime,
                        A99: 'N',
                    });
                },
            }
        };
    })();

    var global = ArkWindow;

    ArkWindow.app = {
        viewModels: new Map(),
        config: {},
        GetModel: function(view) {
            ArkWindow.console.log('app GetModel');
            var viewRoot = view.GetRoot();
            var model = ArkWindow.app.viewModels.get(view);
            if (model) {
                return model;
            }
            return ArkWindow.app.viewModels.get(viewRoot);
        },
        deleteViewModel(view) {
            ArkWindow.app.viewModels.delete(view);
        },
        GetAllModels(view) {
            var results = [];
            var root = view;
            var model = undefined;
            var rootView = view.GetRoot();
            while (root != rootView) {
                model = ArkWindow.app.viewModels.get(root);
                if (model) {
                    results.push(model);
                }
                root = root.GetParent();
            }
            model = ArkWindow.app.viewModels.get(root);
            results.push(model);
            return results;
        },
        OnCreateView: function(view, template) {
            ArkWindow.console.warn('app OnCreateView: ' + template);

            var viewRoot = view.GetRoot();

            if (global[template] && global[template].ViewModel && global[template].ViewModel.New) {
                ArkWindow.app.viewModels.set(view, global[template].ViewModel.New(viewRoot));
            } else {
                // 统一模版
                ArkWindow.app.viewModels.set(view, global.baseView.ViewModel.New(viewRoot));
            }
        },
        OnDestroyView: function(view, template) {
            ArkWindow.console.error('app OnDestroyView', template);
            var model = ArkWindow.app.GetModel(view);
            model.Deinitialize();
            ArkWindow.app.deleteViewModel(view);
        },
        OnResize: function(sender, srcWidth, srcHeight, dstWidth, dstHeight) {
            ArkWindow.console.log('app OnResize');
            var model = ArkWindow.app.GetModel(sender);

            if (model) {
                model.width = dstWidth;
                model.height = dstHeight;
                model.OnResize && model.OnResize(sender, srcWidth, srcHeight, dstWidth, dstHeight);
            }
        },
        OnSetValue: function(sender, value) {
            var model = ArkWindow.app.GetModel(sender);
            model && model.OnSetValue && model.OnSetValue(sender, value);
        },
        OnClick: function(sender, x, y, button, keyState) {
            var models = ArkWindow.app.GetAllModels(sender);
            models.forEach(function(model) {
                model && model.onClick && model.onClick.call(model);
            });
        },
        OnMouseDown: function(sender, x, y, button, keyState) {
            ArkWindow.console.log('app onMouseDown');
            var model = ArkWindow.app.GetModel(sender);
            model && model.OnMouseDown && model.OnMouseDown(sender, x, y, button, keyState);
        },
        OnMouseUp: function(sender, x, y, button, keyState) {
            ArkWindow.console.log('app onMouseUp');
            var model = ArkWindow.app.GetModel(sender);
            model && model.OnMouseUp && model.OnMouseUp(sender, x, y, button, keyState);
        },
        OnStartup: function(config) {
            ArkWindow.console.warn('app OnStartup', config);
            ArkWindow.app.config = config;
        },
        OnConfigChange: function(config) {
            ArkWindow.app.config = config;
            ArkWindow.app.viewModels.forEach(function(a, view) {
                var model = ArkWindow.app.GetModel(view);
                model && model.OnConfigChange && model.OnConfigChange(config);
            });
        },
        UpdateRender(view) {
            var model = ArkWindow.app.GetModel(view);
            model && model.UpdateRender && model.UpdateRender.call(model);
        },
        OnActivate: function(view, active) {
            var model = ArkWindow.app.GetModel(view);
            model && model.OnActivate && model.OnActivate(view, active);
        }
    };

    const uniqueApplicationId = (function() {
      function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      }
      return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    })();

    /**
     * 有很多地方会用到这里数据.所以这里最好还是挂载到app上.
     * @returns
     * @update 2022-07-30 22:47:10
     * @author alawnxu
     * @description 这里之前挂载app上.不过后面发现不可行.因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
     */
     ArkWindow.getExtendObject = function () {
      var appKey = 'f1ed104a27e44edab8a24d8915482a1a';


      return {
        appid: 'com.tencent.forum',
        appKey,
        images: [{"name":"images/application-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAACXBIWXMAACE4AAAhOAFFljFgAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAADSklEQVR4Ae2aTXLTMBSA35PbElZk21Jm3DX9CTcIJ6A3IEdoF6TZNd2FbggnAG7QGzQ3aCZlwa4ZSOkMK7MBT4r9kNK6uB5bflIy+aH+ZjrjxK+SP1uWnqQAFBQUFFiAMIdUmhdl8EsVedjvtlb7YIGAOaPyZlAJfq9cBBSeyr+L7frVIVgwV09sJCXwVB6W498jiWbvePUIDMgVqzSuqgHRoQx0wQjyCKDroDjiNKcsqbsLNZRDfWU/ZGXXZzAefefx8EW3ueFl16OXijCR075joRjWYHzcwF/ezTqZJoXqZqDYAKJP8VjCsMl955a0Z1FWRrGPiH3gQFSmnLuvyJISKF7eNt/aVn2gKn59V/SNHOQ9Ob1Ygl5rbYMTt9UY1OQVfNDFMKRGnB+vW8nNpLvnSkUoOdNmOXUx2cu6JlIRpnJTF5NDh2qiRlIRWXKjTCXB1MWS4yEBnpikTQ5BO/ndH3+pkvxu+u8Y3r/jUm2P24XH3s1/xckn/rn1rJOMnbpYr/W0aTM+6TqctPiZ9IqmHYFpL6qYWXbPlbORUsx02pInZyulMMo8thuXTU4cEe5APBfTkJlZHHwvB0A1sBwajMSIgDnp40lFpMrJ3jIeYyKl0DfFUHRhAjjgdPJi0pplhKmUQivWO15rE4TvwRJ5QV5ItM+9oDQ5G6nb/8tHpSy+X8qdhiQplXxPN8HM4nl9sCeEeCUbZN8B3gy8YNHJX8yRzTD89agGgoybouzZ+uet9Y+TLBNC9ITIT5z1izlq7kQkB0hywRrsnL9du5fPbR5cnsmKK2CPWhOxzzxCCvbGk1JQdbPxrRp9Ust5Y0op3Jtry0Y/jiGYN5XUYtCNjgMIXJgAhPhEd94o87hWS2IMVsJgV1b8jhOLgvaH5JxwYpflkjcwMRL7whxP5CqVx82qZJrmscs9uAQuc7cpMSkKsUWjEFs0CrFF478VMxqgVZ7HiQso2AEmGKLLLzcELkZiaiefF8nfsyeEQ1mu1S8DdOQ0ReYOZg5qXpZ2PA5I9FN3Xism/GEbx5WTmxDxTYPRccZqFLvI0QKP086J0TOabEJQjU89uIQQdtJ2QhRb9a+7KBzjeZl64k7p+sRmkaigoKDg4fIXKkzP3nM/kBcAAAAASUVORK5CYII="},{"name":"images/audio-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAACXBIWXMAACE4AAAhOAFFljFgAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAAE+klEQVR4Ae1aTVIbVxDufqMIpbLRKlXEpCL2gMUJLJ0AfAKJE0AWAXYSGwc7i8AJgBNEOQHjE3hi4qrsLMcQZznZBBXWvHa/kTR6Mx6N5k+UZeur0uLNvL9vpl9P99cCWGCBTwII94Bq+3UZeqWy2yj1bKu9asOMMTNi1cN3NYecLQSxTUCVwG0mhhagvDDAMK3j5S7kjNyJDQhRC4Bq8UfhiYF4mifB3Igpc5O3Sy1+O3uQDl1p0ONXT1YsyAG5EFOk+rfFS56sGrKATYAmgfNGoLCJ8CGyaVJIX7e/EM2XPy9fQEbkQmzt4ObFR6TQJXP05/H3ZtgYNtmKA04bCBvBe4SyPmlcXGQmtrH/rsUbaevXuK0IteOMVwQl0WXAwXSNr+82s3hPARmgNpWFlIJyGAKxjoBd7XLFuS3+ChmQiZhDsqW3k5IaYUQO3M+Ah6Z6cJASqYkNF22O2mzT3UKpfwIpocghwql+TYJsQkqkJsYHv+a7QPwdyhhRiN6dejDeHETQgJRIb4qEW76JCgUTMsI6cR+MqV2quOFYCmQ4Y6gvaFtPvs3nw0r4XG/3e4UqpEBqYnymKlozt6CWhLT962AFUiCTV/yUsSA2b1gQmzcsiM0bFsTmDZ8tsULUTS8fEkYZpFPm1MKEewZn1l0I7meIKFUrkpiXsjtSNbv8W9UWVEFvZdhMFYGHQcWGBFP24/YDtf7mpHkiTZEGZEYo+zdAb/R7a4dva5ADWMV6pLc5ebXG+yFvD4QYGXhHEkOUvs3rpiCROr6JCLchIwbza0IrK12j5LW65+Zl44dL9F/UXNHOQwpfjqVnzYWe+yTH2S5gI4tG4c4f0FB4A56+6BSNmn6HZYTI/C+SmCBp+i6Q8FJ1le0GNIoyS9tnkBLrh9dNCGgoStf3OqDhy9hZDzGj5oskZv2y4nsrzKyqp+pBjUKZ0frBTWJy1Z+uq3xofHKb5IKF3+thTbttTxNUp37Hgm9F9oqeNu9qFOTsBIY0N1gZjmuWGwf/7joCX4B2fpTH02W8wdvUBFWEzrR5pyrB6tA6S8XX2sK2gWJTf5rsEdtIohUy/Jz7XgS/f24B4/+lJiHsQqDEpEyQNf76aH5XCmc3r/fjOVenVWZiSdwbhzdtlsK0jaN59fS7ut4ngtxwobHSG1IvG/bxk1IYmnZT63R+dfxgB6YgVkgVfpb+8Z0J13SQdgJS9XiEW2EZ/CAU2BFKr9dIqboA6KQYBogjiIHYRYn1/b+32TP95htMov3y2bJvoVEVhe89mkxCnyS8KsOkGiyZn+vXkkjoiaotawdvT7j0uuubIITcCOphcIRQQzQeInHUgKxFEtl8tiyU+MedwM5fIWclrIKj3iib/2OIicRlpPX963PeYFB67hqBs5EGQ0dxFizzKi/JZlpPIqGnqo9NIKegvOBRUoIDL1na5bekPiWBmDQ5qeG4dIj2gmgiwe9CoBWW6rgf+btvKrLfr7FZbk0sxCNdGKX3e2mKHZkqmiqiF2ScTXMSQU85vT/YbJJHr56tpC5L5VOD5rfHBBuxvGD0ZmwOpU5VnS1rSSrXv0M4va84deFAmZL8xwNGLv95HoS8KWEGcL2bfF91XT0YPwzPkOYUsKP+HoGIFp+hziz+gnQv/6XiKOVScxDdq6cPVmHGWMhv84YvU1fMC4aUP/aNgcJEDubuKBb4HPABhUNFZLkd6UgAAAAASUVORK5CYII="},{"name":"images/avatar.jpeg","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.forum/images/avatar.jpeg"},{"name":"images/btn_play.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAeKADAAQAAAABAAAAeAAAAAArKnfUAAAKU0lEQVR4Ae2dS4wVVRrHZWx7IDYCEx+kcfTySMuWkLQYdWHHSUYdk5kNG1jNwgUbQiauWBISWMyCFYk7tpgYF74SSbvBVxNwmMREiA8ebcdHqyBOQBpx/r/LPTenquvW61bdOlV1vuTfderUqfP4/v2d+s6j6q64qxkypmbcJ6ztYY2Oq4R7ehi3wgretdTDTSt8XeGrwpUeftbxllBrWVHT2q9TvSd7eEDHiZLa8Yvy/V5Y6OGnksopLdu6ELxSGugIkLpBwDqrEKz8awHCLwg3BKfFZYLvluYeFaaEh4U/CC7JbVVmXjgvXBR+E5wTFwl+UFp6TNgs8Oysg/As/0I4J3znUoVdIpjud5tAF1xnoQv/RKAbr1xcIPgRaQFiH6pcG8VW4FtlB9GXis02W25VEkxX/JRwf7Yq1y71omp8Uqik666CYDziaWGr0Cb5TI2dE0bqeY+SYMrCeXpc+KPQRvlVjf5YwBn7fRQKGBXBTETMCOtH0agalPGN6jgrMJFSqjDWLFtwop4XmEb0ckcD/MMzvmdmjOnR0qRMgpmYoDt+UmCu2EtQA+hki8B8OUOqUrrssrroe1Xhvwh4yl6SNYCH/a7wv+Sk2VKUYcEsBLwocPSSTgMYBDN380KhXnbRBDNZ8YJQ1WKAiq6tMC1Ll40DVpglF0kwztRfBSrqJZ8GzHP5B91eiPNVFMH85z0rFJVfPvU04y6c080CGw5+HLZJRRCC5UJuWQ7bsG2s4/3osiMwzTmUJQ9LMM9cuuVh81EWXkIaMCQzhMr9TB6GGLxkHCr/zA0xU+Ap3fVG4ZKQy7vOSzBuPUMh7y1LCSULjldH+FJYEjJJHoL5r2Lq0Y9zM6l6qMT0kszjsz0o04xXHoKZftwkeBmtBug1seb5LMVmJRiPmbllL9VoAKf2eyG1Z013m1ZYAXkmbWKfrjQNwAFcpJK0BK9QbjNCWxfqUylzRIngAC7gJFHSEsxODL9Yn6jOkSWACzhJlDQEr1QuOFZe3NIAnMBNrKQhmA1yvmuOVWMlF+EEbmIliWAW7LfG5uAvVqkBuIndVJFEMPuWvbitgViO4ghmzNv0TeluU5eudnAEV5ESR/C2yDt8pIsaGMjVIIJ5EYxZEy/10ABcwdkyGUTwwP+IZTlUHHHs2LGnL1++/PLZs2f/uW/fvi0VV6fK4iM5i5oNwSv7e5U1TVs2hB44cOAlO/3c3NyHu3fvfnNhYeGmHd+S8OtqJ1tw+xJlwbUZFu3YsYMvAARkenr6iTNnzvxr7969bbTmZdyFCWZ1aVNAYw6fjI2Nhevfre3ExMS6gwcPvnTixIl/TE5OtmnHCdwFVgjDCsIiGqMQWfgTp0+fbpM1w12gVwsTPNU1gQb9Wb16ddusOcChTfBK8crXbBopLbJmOITLrtgEdxRjn99J0aC/LbFmOOwY2mxCIwfKJmGTji2w5j6XNsEbmkRiUluMNc/OzjbR0+5zaQheJ4W0co8z4+YGetpwCaf9Z27fpIlsmzTUmrucGgvum3TbyLXb2zBrDhDs1317TDfImvnMcreLZrd86n22PT00/tAAa4bT7lwuX0r3EqGBBljzfTyD/ferIsi1o2pszWs9wTaTMeGaWnOX4DUx7fKXQhqomTWvwYJbOcER4i3TaY2seRUEN2b9NxNLBSSugTWPQzDDJC85NeC4NXeHSd6Cc5Jr3+aoNXctmK+deilAA8aajx496srbmPfQRXuCCyDXzmLnzp3P2ecVhrsEV1h+Y4vO9CWcMrWABS+VWUAb8z5+/Pg7jrR7CQ8agv0L3gUwcu3atZ8OHTr06pEjRz4vILsisugSfLOInNqex6lTpz7atWvXG469MnPTWHDb+cndfget1m5Lv4u2I304pQYctVq79l2Cr9sxPpysAcet1m7Adbroq3aMD8droAZWazfgKgRfsWN8OFoDNbJauwFXPMG2OgaE9VL5R3qp3DUPeUBtA9FdgvnxBy8RGqip1dot+RkLviXwI4l+Z6WlmhpbrWkFnN6CYIRvEHuCpYQGWC18InDaX+xfUHgjEW2WBlitTR+cBgi2L7Yq3CCrtXkLEMzv2DLh0boNeA2zWkMwXMJp/+1Cwl/zpy2C1e7fv/+VmZmZ1xxbICiCgj6XxskiU0x6SxG5u55HQ63WVnu3eyaCBX8jFxS4bU6aeGy41RrK4PCCObEt+IYi54WBn6Y1N9Xx2AKrNbTAIVx2xbZgIs7fiW7O35ZYrU1YgEPbgkl0UWCHxzgndZcWWa2hCu7gsC9hC/5NV77sX3U8sLS0RH2XSQut1ujgCwUCOgkTTMLPTGrXj/oEEg0KCFa7ffv2fzu08S1Qv5JPzoXzD3yZtHeRHyNeLzj/5r8+f3R1amrqhr4o+6fFxcXvDh8+/OqePXvelwUH/ovDjW7oOWPf/4TbtiIc0Tuf1PFvA675aDc18Iaq1R//mipGddFcI+G3JpE/Oq8BuFpGLrUeRDDXPuGPl1poYCBXcQRfUtMWa9G8dlcSjuAqUuII5oaTkXf5SJc0EMtREsH8gkdthk0uaX1EdYGbwK+shMtNIpj0c8Kv4Rv9eeUagBO4iZWocXD4BjblkVngxx7Cifz5yDXwgUr8JqnUNBZMHsyQJGaWVJi/XpgG4AJOEiUtwbyxPitgyV6q1QAcwEWqrwik6aJNc1ipYJ/PFhPhj5Vo4IRK7W6JTVN6FoLJjxfV+GjLQ5x4GbkG/qsSP81Satou2s4Tzy3WNbcT+3BhGkDniV5zuLSsFsz99P2Xhc3CuOClfA2wwveWwGMyk+QhmAL4cMu8wPN4TPBSngZwqlgpyvWSYF6Cac4NAXcdkvN09brNS4IGmIN4W8i9JjAMwdSNruMHge560NqyLnnJoQEehe8KkcuAafMblmDKwbOm++gInmQpoQCB3PeEr4bNqwiCqcOPAt1IR/DdtZQwhNAtY7lDk0sdiiKYvLBkupONgne8pIQcgkPFM3eobtkut0iCyZdn8iWhI/ghlJSQQdAd3nJuhyqqrKIJpgy8a/ZWrxfuFbwka4BJDMa5uYZCcdmXQTDlMU4+L9BV+2lNKSFGmH5k8SDzJEZMnv1LZRFMAXiC8wIT438W/HNZSrCE5y0LB58K6KoUKZNgU2GcL95AeECYMJEtPzJBRJecelUor75GOW6lrMeEx4W2fp8aq/1YOCeUZrXKuy+jJNgUulKBaWGriWjJkQ1yrAbhhI5MqiDYNO5BBZ4S7jcRDT0y7Dkp4CmPXKok2DT2EQW2CU3ztnmdhDcOmBeoTFwg2DR+UgGI3mAianrkLT+ILWw2ahg9uESwaQddN8/nTUJdZsMYwzK5w3O2kq5Y5UaKiwSbijKEe1SYEh4WXFvEuK06Mc5nQuei4OQ7yS4TLJ31Bc+7I9CN04WvEqqQ6yqULpju94IwUo9Y5WWWuhAcbtg6RRiy8cLLmkD5RXkzGQGhgG3DtZK6EhxWMtOgfHJibQ9rdMTKxwWucWS7L0CYKwc8O1l/5Yh1MuvGTxwAJv65Vmv5P0QCkFCTA5RFAAAAAElFTkSuQmCC"},{"name":"images/channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAKqADAAQAAAABAAAAKgAAAAD30ocxAAAFY0lEQVRYCe1Y32sdRRT+ziZaq1Zbtb/EH0ijYi1CHxSfpIK+i2CeiljSJIJ/gD4qaJ8FQUiaGgj4EhB8URCrRagiBR9aFWMFxZiYpGlrU6PGJneP39nN7M7cH3tnS+uDduDePWf2mzPfnJk5c2aBa+V/6gG5rHGP6gMQ3LnedgWD8mVtOyO6CwnuztoJVnFQPq+yUZ/ohG7DCo5Dcf96Jwt8PoEhOV3VUfBuXDeT2he08dC6jfOU92FYvg5wnpJ4cpy4gq00utEDT9MzZz29u9jAHQRd5wGnKVfaqE9UsY3Tvt3r5AIG8JundxeVRBU7CqBiifIVJppgNzspvaH4ESJadBojNNBH2M0edJbTvurpLeLleHR3k5WpJr27Kng4ACXour7rE02xq+hE0OAy+KbQ44V8I5b4jpvIQXqdEDwP6+OB7pQUvSR2G6felTPcSAqHT703DtH87GWLtSK0gfYu8LeEMX2sGZrpB+WEPVvD04g+x9rxpi5LasANbOcGuEbsX5nBOn+CDUhxfdbEZkXxR5vm1mfKYT3NOP2V67DECfay4U1lRaXUS+ymSkS7l/6wFT2E3NIOxrofMm9TaLdGm9dPBxv/QrXgPP29aD2FHp3UHq6YZdZ/0kJDObYEO+nB/DTJAfOsrbfrLQ6DIa4sU7Qxt642L8Uphi2LsYTUKYf1Pa6aZ70mL9LQiKd3F0fV1v8LBTDBq1yDrxV6B6Hd1LeHTupGdlCeSMpN1FMzNKlaf/cGHaQ4GegdlHiiy9mxt6Wwk+BXEj1T6DHCOG7nYG8toJKtv+lCrxDiia4yGRH+ynIWl2oStWRESNYVxQIP42yzuKpOz3iigrtoxLIeVxbdQncVXZ82UD8ZyYP9FSaa4hF24m++ervdRtHIIsaGYkCCWRyQlUKvEOI9allTWL4N1SgttKH4PqoVQXFEP1TzQn5tMMuSHXldMx6DNpUyobEXErfjDRpHdJ5BWlHueGCebSsTXTMelCO6KdhIwDm+/znAVChxRBvZabLDs3OOQ6xHNG0Kb8LBpnE73votj9Bj2stmZebuseKJ2xd4Q/A7Y+ifGFfLpMqynX7/hUnKsLQOIsliqCHyorhI4SzyZVXaMGmZiWC/NPzKkuhpjJFMn/+Scm424bS7DgyQ4h7G0I+bsAlmmAIqh3tEX8eAHA/eW8Kt2FzUCe9Mio84sLBI1tMsJnW/TzYnatfXS9ld6NGwVUfNMqzWLMsGYwGsgfswoi/Ts+8XFiy8+UWJQfbza3PXKCZ9kgZwa9ROHX+zhI3ragr7QPEWM/8hesbyTSsP5o+I/zZ3qNyjq0yULQEu063QWr7j8/Uo9L1yjYKfEPxiQ1YmwIobs2rlSaY4xIv0Vkzom0xhdnrwVfZlV+x8QfkHifBNghMeNhPLk2ZM93DKSt0he/ixocGpKLOek0QN8ve3g3DNKo0Ln3v5f4ia+9xjELtmTLB+H+tdLvsd6w5wK7c/lQakJaNqJWam/WIXtxRHWZVfTwSfcXU+hSdlzYcV8qj2U36DpMqNad+WbAact8HPOVtoo1+i71tujRb9tAiSbZqcZP5ypiNJez8kkyQ0RKn0in2wKEnahpurQ9LMdieaYo8BiyIR5/OwHKPl50koDFHOSI0z3jXpTrQ5tmpkVj8op0jUyH7Anx+FzT2nHIHYZzVRu36k3scsO58F07HGeRf6ifgB0nyXzzxKWA5q36tqlmqiFlrC+GpEW4/Hqk4HZYHb8CVC3ubPIsBcbFbvm83jqF8TyktUj3KqPl2vXmSknAkhEdp+uci84BX61Ab5DPOEqKw+wvJVgtgp9Y6GyfNV6uqa2f+MB/4BqOZgNvucZWcAAAAASUVORK5CYII="},{"name":"images/feed-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAACXBIWXMAACE4AAAhOAFFljFgAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAACxklEQVR4Ae2aTW7aQBSA37O7QF15myYLsq7SuCco3KA9QcMNyqJJ1U3IpkrporkB3KC9QTiCS1SpuxCJNlJXLImQ53VeEqrBGBhH82yI/ElI+PH883mG5/HYACUlJZJgluSwdRnAuBKAQ6LTrQEIYCUWfriuxkQdAKqBewZIXrff3joBh1iJ7R39+aalXoMgWq6VJnd/Ur/qr4HyVfPnp53IZnseWCErdbsHVK0Xh9fHZuxe6vxu/1TzYjx//nEY2mzPssV+k7HCgBB64ALCIHnSkLDZbz87M6SqibVGyqf6qpbLLKbX6F6cbjfAEXuHwy4gvjVjiHBCxLE5qSkr5Sy7ohwX7Z0DrdIzY0RwbErpsz9CwIGREqzqloWLMf7NzRt98Klnn6U8RXUPsZ5Fbi3EorPdkULVTManUtGXnYivd1nk1kKMCwWS3zFjptQ0tkgOY+wkt1m4WFr1S5MyocRymkShYlmlluTPVenCxBxKpeYXIiYtxeQulocUk6uYCylmldRtDuSEKylmlRSTi5hLKVvExYqQYkTFXBUKPdzvQUbExFxWPwR1BRkREcurpC9DRCxWk7BIKUZEDD1/5jaCKG7kKcWIiOk74H1z2X8a95I5klKMTIvNHmwUtXZH5u/SUoxzsfDdZUCA/7uivneaqWjh+7+htBTzBFxTqYRAyggg7R0N9YSnxwUljGESmOkSUoxzMaUonJ3U43lDDtBcrpQU4/4/hqpqlSYoxThvMQJvf1HrwN0scoQKf3ikelJSjHMxXREDPbYb6JIfEcRXiBhNwO/9EnpctAjnYv3P2y9hDViLeUUJSrFNoxTbNEqxTePRimW/QBPU9DPpDuSIfh79Km2YtoyHjDyq+nMAuZJNirHsitnn9eTA7zZZVmI+YuMhk5bO0cegj6VplQoZ4JfExo5fErOlUhmPknMnJSUlxfEPy5U3SnSCyNYAAAAASUVORK5CYII="},{"name":"images/foot_guild_icon.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAC9FJREFUeF7tnHmsXFUdxz+/mWkBAaFowpJAlU1TIGGJJqTBB6Wg7BhtC1KQ0nbuvFe2YIgSWcoiEIKKhfa9eQ9asaC2JSolbCIIVBMiibgUsAoYZCkgaSEIdHkzx/zOndM7b95d514sje/+A83ce3/nfn/f89vPE8auWARkDJ94BMYASmDIGEBbDaDlphwrexpNRExhW9wYYQWlomWOMWirMEi12c8hCDsjNEetwVCixEt4sha9Nw+T3PMLzU6UmESZCk1GM1PXMcyzzJP/ZJH50TBogdmO7fgb8BlgE9App4xhBjW5h/mmxHwZDWLavadbebo0GDQ9GB4DhluPOpn67u2AfwFT8OTFLDKLBchp8zYzkXGsaS0s7FP1Iw7Hk79m0WYoZvNNhfkyTL85ixJ3tQCqtN3bANQePs379HCJfJhFZrEAOTYsMidQ5gEYRXWlvhrSd6iwD7PlvSyLjQDIZ+CAuRrhSmAz0A6QKmMccD+enIxjXEqGFguQEz5gLkBY0AKoXYbSXQH6IxP4ot0aRV118zPgDMAxxr3Z/XsBnlyEY1xKucUC5IQPmgUYLohZ7F14cnZu9riPVMWs5w9222KdQru7V9YKhgupya0fDwYNmvsxnBhiD5TuFQzXUJOrshjLUIU7m3eH2ZlhXgU+GcJa/9EGJ9InD2aVWRyD2t1thSeBw0IY5APUZCa9cndWuo8OF1ohQt0cYrftSNvTfvtGNvM5zpeXs7K2OICcgV5o9qfCE8BeHXT3qa6XoYeaPJmV7qMAcjav30ynxLIQljmZr7GR/bhQNm49gNxih8xRNC1ACkYASmAb3qRCD7NlTVa6RwJUN98BbgixP749Eh5nLlO6CUiTGaSGN801kQqzZAMD5kyEn8bEI3+mzBRms55BKqwNiXrTyNN7AplLEM6NdAqGIWpSpW7GpZJ3FQ0HZjJAaRfrtligTd/eBJf796/w5Ku57Y++18kcMA8hfDnGKcyjJou62dLxACl79uI4ShH5TTt4SuRhNlPiEgzHRdLd8AgVrsMwAWNjlu4ulafZFeyCsdtL05pOF+/HQPp7mV+37o2WqW807ECDp+iV19RehQPkPFLd7Ac8B4zv7iu2uad8QMucyhy5T1keDlBA3dMQftnSTNqv1SAtjplquLtPTsNXkSRT5SXVnvR3NQlvU+YY5shq3ZLhHxKkDJcgfD+EumnB2pbuc9tzDSV6mCtvqo2LYpCfIdfNAOCFeIdt6cPTrtU5kUfxZKqNl0K3gv6gebFmyHXzMHB8iHdIK3Rbus8HSPgJVfmm87KjGRQY6F2A37ZSBi16xdeYfbsTXxP2bU+SLcgCapEydW3jEK6gKte5kGA0QEGF7iCMjYg/9X9ig3zFNJlBryxPBmjIHEGToZbG21OGMA3r7xoKHBhRRXTPvwy81fIWeZmkGleWH5BAOa1svpeC3UqWYRqcTZ+scTlbtDvWIHFvdmBDwpZoUGIP3ucdDsfwELBbZMAmnElVfs4SsysfbKkdZ9lS/r0VynjyLkNmNk1ujyxxwEbgUDbyT3ZkfOK36Lu1qN925U81giLZVDRK9u2Mvte927HnQ4QeqvJ0NyH/CBSdzLq5ArgmskgGr7CRA2wW3+UVD1DL1cW++2rKNiQYMLMQFod4PBdfvEiJo5krr1qAtHHY7aVJriebqZu7gW9EyjQ8jMcJmcR0tKCKYJBfNO83N1BCyw5RNeEn8aTHLjZPL6z92bp5HNB3hss0/IiaXJxHXn6AnHoGzAqEr4fQ3QVgS/HknNxZvEuDhszuNFGAPh8jsw9P+vNs6WIA0jqL4RmEg2I6GZfhyY15Fmt1EYQhh7bCkLA6tL+tDSdQk4fyKCUfQI7ut5vdaNjO5Y4xRfPT6JOVuauIzkAPmK8gPBhjoN+lwZfok7/kUUo+gIIimbZbtO0SFW1vYpiDmCcv5LEHIxhUN1WgHuMUtEzTgydv51FKPoCCrH8mwtIQ9jgX/wbvs2/Wtm+o9wmUcjPwrRgD/Rg1OdYlnd3Uo8OT1Sw+MYhHrgO+G1NFfJSaTM3y6sR7B829GE6NNNCGH1OTWXnsT3EADZoVGOvBOuvQzv0uxJPzc28vh9pyM571rG6lGZ1pkIu7vo0nN+WxP/kAcgZaWbSnbRQeGdkoNPRSk4G8i90CcN18GtC87hORTkE4jWp+p9C9DXK24HYzkYbN+ifGFM1PoiYP5KV7WxfjSITfxSSgmzAcTE3+kZe13QMUdDUnU7IM0lpQO93d/79Hkx565ZncDAqcgktrOrdX4BTG81nbp8sTtScU1+PtZBCPRDUKnS14odVJfT2Pu7WLCWRej3DZR9FJ7fzokQzyy61JlUP/HZMoMV020W+uoYRm1eEG2rCKN5hin9kTie1sTsLYJDZqZjHwmsuBaTFOYRBPvG46qfEAJfrWkBsGzDKE6ZEGGu7Ek3NT2x9XQegEyW0V/W+dJxCOipkemU2vLM69pUdtMZ2zaTCVJmWbycRd2oMUy7YbgX1jcrCVCIta1b/orqZOvmpP6kBWcYwMj9qOzincYfZi2DqF/SOdgq5JBxb8imO0TPcNOmzRK2+F2St/iznh/WYKJX6TyzZ1w0L/GWdglzGeGrPknREMcAZ6kTmCsgUoOu9LtwYnT1WjfbBVYYzzAXLC66YXrLbDRnejxGo3Ms4bqrFO24NXFpURVlHhLM6TV7asLTDQpyCsTOjVqbykgpwbD15DRadNJNSJOAb5jcIBcwvCRVuxUaha1Y9T0J+nxNeYK89b+6UGXIc+6+Zi4IcF9Or8KF/4PbvSY98dEhJ0Mkg1c0oBwtORPPoul6KspcQMS3+tOWmZddD0Y6gVoETXKLyHqkyLciKyBbUfmB3Y0e7tLxQgPC9A+rwD6V1KnMdc+YXdbuttY+CYAnp1Lk77Hp5cHg1QMPy9L2XbSd2nNYyd1CUtsqsZNZ3hDGkDg8duLGW9LcztHpGDZZkc8ac5mpxDryyNCglkC3JDZgpNHm1rDXefhmTnT+fgU/sb3G+bEO6yZzx8D1bE1aTBZPrkqagoX9pqvHoY5DZ7TCCuD6/RTwnV6M42no4evVUNPWvfZ+xQwMi4KnjPTsDBLZlRQOmz7hhDXJf3Q3smI03/3z9xtIFhZtAn66NytoAlur+fo8yeCQHieMo2CfSnWfV0jXqcsGnWdQjHUpU/scRsz6YOV78WsbImIKzjCoTLW3Ynbrs5kDrZ46ZZn+J1Juc6PdTx5uzbKMiHTgc7fRZVJFtNmR7myLrYJDWYJjkf0DKqHl3q7HMlbSd3/2I8mZ03g28XNjpZTVqK66TWzaXATZGTpcIjVOV4u4Wfw3BVBDN1FklLJf7A1jQMixF028XZpc5VuiMOl1KTm61d1VHeNFfCYb7sDAo0rm3mWTFVxGw14SCV6KHMPYBWDdMyyQV9roroB74FXNkBslmTEQZtSKBt305Nd18TDlIePXuhIOk4TRJIxQ9HtAGbDSDHHj+ofAnYI7ImbDidmtybuUgWgLSPndg3TE4AKSjMNTnazjfnPeaZGyD/wIq68Kj56WGaHEavrO7KYDqQ/I7tErDtnU5n4D7DMayY4YhcXiyYnz4R4f6QLe7ovg7YG08+6Aqg9gqD3+K5FdBOqoLRGQY4A303NZmZujCX0j5l22LB4MBFGG6JLJIJxcQjqhC9/DOp17Zipc4BLbfFrsSTa7cuQME02YDNjaLncnxt5uwoWHBGjiXPA3sWVhXbGVlPx5MVRZRZo+OgJNoFbZf7EE4GNoSc6NnetqE9ub4wY+n+7IR/Pv4MDINgUx0t7OmJ5mGEg6nK3wtRSldGOmgUquHUPpjOAnW6YD2SrbPGM6kWcOSyU2GOwYuMxkp3tpqVyqc7qMqcJP1283t6G9R+gLZhvYoeQ1ID2f4OpX2ZJivdcaJupyoiP8axeKHZmzInUeLfbObhrH9yIi1Y6QFK+8b/xX2dcU4Rti5i3d0BpAucFFOoL/pP34Qt3vdwvpdrO0JZtH66A6joVXyM3zcGUIJyxgAaAyjf/v0v3buzQoROKoEAAAAASUVORK5CYII="},{"name":"images/foot_guild_icon2.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAV1BMVEUAAAAAaf8Aaf8Aaf8Aaf8Aav8Abv8Aaf8Aav8AZ/8Aaf////+cx//e7P8tj//v9f8Ac/++2v9pq/8Mhf/O5P96tf9Wov9DmP+Lvv+Mvf8AfP+t0f+t0P97G4Z7AAAACnRSTlMA38+/gCAQX2BgDWLzYwAAAQxJREFUOMut1OtygyAQBeCNGtNywlXjJc37P2fXkWK5pKQzOX9YZz4VF4SI+q4VT9NcaMv5JP7M6cyITUX19Cmq6aipo5bEC/k/GqSUZi+/pJzKSAHalxpQZeQAu1cGgCmjFViiZybofuVIYOSBYxlto4nQjGLiJ92KZozRtL8D1z0asDy4fOIu3CrgO5CjFXj4rgIwZWSBW/gMLcpIA3P4DJuio8uDXzlgydGglHIAFIcvR2DlaoiRxZHRCF8tMdL4FfnTfhchIzkAtB82yVH5xEfAhQWy6c6M9plXS4rSLk9hOgfK9+4gocroPk1zqB8mQu/779q6aairowv19aPnxUOM89E8J23XE30D9Ns1gn8OswcAAAAASUVORK5CYII="},{"name":"images/icon-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAh5SURBVHgB7d0/c1RVGMfx5wYHG//EP402rg02MgSxwYbQWDkDjpUVoUJsCK+AzSsIaWRSJbwANYxUNqaSCgmDjTRsGm1UltHGzMB6n1122Oxukj1ns/fs85zvZyZLCHdhi989PPe5555TyH7WWrOyI4tSyBlpSa38SU2A6jXLDG7JM9koc3hLLheNvQ4shv70RqsmR2StfPO8ANOmJevl19KwYM8MHLzaWix/eo8wY2oVstDO6DdlVgf+qNdqq16+XhPAjiW5VNS7v3kR6NV22pcFsOapXJWvi+v6bSfQWjPrEC4yK4A9zfKC8aTW1J0a+ki7zCDMsGq23cQQHaE7o/MjAaw7Km/MlJE+J4AHO3JlphydzwvgQSHzM2W/eU4AD8q72XpRyMUgvKjNCOAIgYYrBBquEGi4QqDhCoGGKwQarhBouEKg4QqBhisEGq4QaLhCoOEKgYYrBBquEGi4QqDhCoGGKwQarhBouEKg4QqBhisEGq4QaLhCoOEKgYYrBBquEGi4QqDhCoGGKwQarhBouEKg4QqBhisEGq68JBiqfkrkzDsHH9fcEbl6R6Txj1Su9qrI8mmR2aMHH7v1V+dzekegh1g4JnLt1OjHa6DO3pbKrc2LzI9w0qn5dzsn3cqv4holxxAn3go6vD1SpjD3ZtDhyT5nlQj0EHNvBx2epNzQzzj7ctBbknzOqhHoIUJHPq1PqzZK3dwvxeesGoHuo0GxMPKdCDzp1H0CnZ/QckOlGPlC6+Hmf52OjHcEuo+VkS/0xMuh3FAEuo+Vkc9CnZ8Cge5jYeSzUuenQKD7hHYPkozORur8FAh0Dw3zXOBNFSstuycZXBAqAt2j9poE2/pTKndmxNvdvRihM1R7RYJt/yuVCz3xUpx0qRDoHqFzOFSSHnTgiddIcNKlQqB7BHc4Eo18Fur8VAh0DwsjX1SHI6OSw8V8aL0ZcuX4i6t/baXpDY9QoSOf/nsh86YPQ8wU0PO1uBOh6+ZDO33sQlZbLTHu0Zd5zPVNRQeHk9/ZCLX5kkNHHsI8WXpXMqZVmIL5QMe02hDOSslhPtAxrTaEs3Kn0UXJgcnSGtpK6898oGPmNSCMpT62/RE6YkI+wlh60sV0oGPmBSMcI3RFqJ+rYelOo+lAn6DcqMS2oclNpgN9/2/BhGn/2VLJYXoux+bvIvW7nXXbxjEfeBcsxYOxMdcL435ODfPSXTHFxVyOcWhQHi9IkI2GyOc/SqV0gtH3n0qQxZ/9L87YL/vpo1YeOLXy8EFq2Qc6ao24BFf9MSdeDkt/9cs+0DEjX5LnCAMnYeWy9Fc/So7AkS/VvAYeuxpN9oEOHfm2DKxjpwh0pkJHvhT/jcfU+bks/dUv60DHjHza+65azB1RRugMxTztYqXkyLHDobIOdEyH4z6Lm081So4ArAU9/bIOdOjFlpW1oAl0piyMfDH1c64dDpVtoK3s80eHI0y2gbbS4YhZRCfXDofKNtBWOhxWLlynRdYlR4hUQbFw4TpNKDlGlCooTEoKk+8IbWAOBx2OcFkG2socDisXrtMky0BbCYqVC9dpkmWgY4LyxEDJkXuHQ1FyjMjCble5lxuKkmME7HZlR3aBjtn+2MpuV7l3OJSphWYWP+zsOmVtxVEN2s3fROq/jP4eXQ3qp8+kUusPRS5uimlmRmgdWZc/sbl8rs7HuPZxGeiPRn9PioUoF46JXDgmppkJdMzG8tNGQ718erRjU+3sZX1HBDuBdrLb1eLxTilxUHBSrX1t/cLSTKA97Xal9fG9L/YfhVNttWH9xoyZQHtbrV/DrCP1sFCn2mrDw40ZSo6EuqHubyNSbsSzM0I73WBTQ63lR293IdVWGwS6IjlsDrQ+/6Ktl6rD4eHGjIktKXLZz1vbeoqSI56JQOe0W2w31ClY2c97PyZKDt3ThHkKk6UPMDBCV0RbSWd/EHnvgLuF7XbXPqO51qkhNh6VX9sSTHfVWvhAKqM7gY17wt9qiAtmtnXTGW/jzHqLKVs2/xC5+VCC6Xv0s9ZPSSVWHjCxvyub6aNVT+rX/f3qFezxx1Mqu2UT6JhOybgXSRrqSU/HZFL/btkEOtU+fzrH+OS3k7uoJdC7UXLs4TAfu9LQ6UXtJEJN92e3bAIdelF42I9d6d83iVAzQu+Wzwg9BQ+caqi1/NC++mHJfR2OflkEOqrDMaEnvbUjoRvfX38gY6PDMSiLQMd0OCa9/fHVO+O39Sg3BmUR6FQdjoOM26sm0IMoOYaocmEZDbWWIFo+hKLDMYiSY4iq61K9SDx7OzygjNCDCPQQKYIS06v2MN3zsLkPtJXdrtr/7vNe9SgnlJYojNCD3Ac6ZpZdyqB0Q31Qr5owD+c+0DEtu9Q3K7q96v06IPSfh3MfaH0SI6SD0D5+SsKyX1svxRYZFpiZ4B+re7v5wghPkGjwYyb0T5KGWi/++tfEo+QYztRyujnT5cPWznSWONDRWdt8GESgDdEL3NfLjs02N1T25L7k8ERrey4G95ftxpsClwg0XCHQcIVAwxUCDVcINFwh0HCFQMMVAg1XCDRcIdBwhUDDFQINVwg0XCHQcIVAwxUCDVcINFwh0HCFQMMVAg1XCDRcIdBwhUDDFQINVwg0XCHQcIVAwxUCDVcINFwh0HCFQMMVAg1XNNANAXxozkhBoOFES7ZmypdNAXzYKGStNSs78lgA657J+zNysWiWZcemAJa1ZF0uF41Ol+OpXCxfmwLY1CwDvaTfdAJdJrt8XRLAopbUn2e4pw99qbhevtYFsKUuXxUr3d8UA3+82losX6+VX7MCTK9me2TuCbMqhh56o1WTI2WoW7IgwLTRVnOrvO57Xmb0KvZ9owa7kHPld+fLX+eEURtpNMoAN9rduKOy0u7M7eF/F7lYqCX/jbQAAAAASUVORK5CYII="},{"name":"images/icon_link.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAPKADAAQAAAABAAAAPAAAAACoF8tmAAAHPUlEQVRoBe1ZfWwURRR/7653tEGQgAitEg2WEIR/RIyhvWpLKdDS6xWTYoDEoPiRaPxTkBIMkIAY/UMNiWIEAxqVkEDbwyJgY2mvhRoISAEBiRJiKUgq318tvfE3pXvu7u3u7R3XHpidpJ2ZN2/evt97b958HJFTHAs4FnAs4FjAsYBjAccC/WQB7qfv2PpMXq0YLjqpOMw0kQWNxKQ0YjqL9m8uF9U2lPGftgRZMN0TgPOqxJNhohWCaBZ0dZnpy0whdtHSkJ/rzXhi0VMO2FcjFoXDtAqKmgKNAsG0/kEPvbm9hG9FjcUgpAxw/s8iresSbYBX58bQ0XAYiu8ZmEFFO6fzNUMGE6J9q5oISIT8+j7h6bpMmyzBMp1DCJ82k4+5k6/dpK+FEHE5LSWAD7fR50LQC3owAHgByekNdzplNQd4ZFOAHxuUTsPcRBVG4CFjVl6QXtPLserHZR0rQfGM5VeL7E6i7SQoWzVvB4C+3DiD21W0SDO3WgxC5zOAnBchogEA7UPdlB3083U13aydEg/XB/ik20M58FqLVAz11gmPkt8MrOSBt69kZdMraLbKvlIQ2pkXiMqVfqw6JYClUo0lfD5rOBUA7ELPYJr9xSTuiqXs5vHc6XbTfD0fsrxfTzPrpySkzZSxS8+tEqfh2VEKP0CcaCrnsUrfqk6Zh62UijUGsPs1PEyZmr5F574EjGWgD3/bONIsjJGUIWTXLAgqwHl4FM7IDyEzX4B2Z3BK3h0q5T8S+oigiep58LhhZlfzKO0+A+yrErMAcDG2kWfkx6BU7z8inJuJbhPBGEdhiI8yA7RxM3O3JMcqvVva6DsC73BjDR+KNU8Ztx0KyoRYtfQo/kIAtQVK9YA1mwNjyEvD+jM1dOi5bWKcGZ9CXyaEC7H8FeRqki3OWkGFJ1adVMDw6rP44H4AyY31YfW4BN7dTS25NaJYTde3d9XQEvD6dPSOB9NgXJslaYB9QeGDpXdBIXmPNSxINghk44J5YRdTh/EokbxVgWdF1DjTKtyaLkfRTQhJAYwQLhBh+hEKyeOfpgDkPgCZ7WUaEyojr9dLo3Be9iMm/wtDpstQZHqjn3/RTO7t5FSJJThcrDYYq/MOpk8N6KYkzVow5bIYyAmKadRNVWDJULMB6C0kqspHyugTs4SEEJ6N9bgaK3JuUxnvVc9X2jhkvAc5y5W+UkP+cXbTZGR6nCztl7sCnBsUJUi5W+DZAbpP3iA3lTf7eaeOHtWV9+L6AjYMdUTOCsheGjWJ6Zh7AE2xOntHzeklJAw4LyjKkWg2QY5XLRwCryJkSxvLeLeaHm8bnl0pI0Q/D549mk40pS7A5/RjdvoJAfZViwoo8y2sr9/HL8GzxfDsHjsfN+OB/A/CghYajLe6vVQoLx4GY7ZIcScthPGLAPqdAdgO3GSmWIHtSW4WLxTFtWIAeNYYgYVnf/VC/t2AlRaJy8N51SIXB4U6gNWuWTzHpKVRUcNM1txV1SZXkg8Ub0GyeQvJJnIBkM80vh/IJ27TWswZp57X02Y6kDGQiuqmsum2FTXHhGAbMJLLkM5LdBxyHtbIYmqDkEJc0OWYYcGB5F0Y6n31IICfx7I4irlwKD2NbD1YPa60Mb6fYcx4s7EyX1/r16B+PNLvukKL0NGAhdKn4a0Cq0sAtp4F2EM1YKVQRMlwVM8DrGmB/L14HChGFr9oyhTngK01XNEsMuCBt9WyYflurNk5VmAl/wNe2gremNuTWrZsA+wGgC1IJlgp1xbg9g6aCo8MlBMixUUfNpRyc6Rv0tgxg/8pClAxfjF4FSynTNjU5FaADWCJzAfYm+qBZLRthTSOjXn6j3kErdPTzPrLmLGEaR3eozceaaN8pMpiHFjGox6BkA7jitiO8YPCTduaSmkvMyh9VBBtsQu2im/g4XkKJyZdDAVoaF8qpnwr2bWtkI4KZ6KO+xGsNJ4twFhTZ9WWxjVwNA4JhtuImu9ebNsCjAx9QqM8XhyudkWvaw2PrlP4kxiGLaqy4ojQnL11bH3etQUY2882vSZ4gPp42g6hzdx6pt5+YbUYceMq1SP5rWw7SaH87eJxE9Y+J9sC3ODn3xHWLRpt8LvQtRu0Rl7vNHRdJ6dWPIG9ZTfIE3qG8M7VdYsOyNuWjrVfurYA92qyWK8R9o75+NlzH7L4JP1YhRBu0N+hTmpF0hurHse8IeFu6wc+NX8y27a2JeWDAPAllF+g9CM1k/yR9gTW+kE0zqKW3nwKf0MjPKoGnnyWhwK8TEXqt2ZcgOUP2Uf+op3wUH6iGmJpVOIUFXW2TlRevPPiAiyFY82mI4zXwtMvxfUxpuv4YXtBY4C/j2tekpnjBqx8H8+mc3CvW47wHaPQzGp4davHRZX1fj5mxtNf9IQBSwVlhoa3SxDiMwE8B6RM/Mmn2r8B8hRouzx4JK8v5cOgOcWxgGMBxwKOBRwLOBZwLOBY4H9tgX8BYog9CqzhzFIAAAAASUVORK5CYII="},{"name":"images/live-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAACXBIWXMAACE4AAAhOAFFljFgAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAACOklEQVR4Ae2ZTW7TQBSA3xunwtl1Cy2Ss4ZU5gQ4N+gNyA0QC4p3dXdGbJIT1JyAI5AjGALrRJCq26yqKKrn9U3adNH4t0qbGWm+jaPxs+VPnvfG8wJgsVgsFovF8lxg3qAfTfZhsXcM2uBM0/jlqMkVG2Ldk3/HgM4P0A4cjb++6tWNFhuXozgFLaHgbfg/qBstcob2QVMQ0Ksb2yq/EaSENITdEQDhh7IAP7wMMiKeZTR12stPadSZq/FSMUKcj+ODBHZEN5ypQ67YWigjGazH5NWLX3wYqN+lYjqSJ3SPoPs0MkqMCD9mIP06sY3EjsKLiAgqqyah7P2JX49gy3DO15JSCDAUlpwTyMLCZpzYSgjlmWgvOy1sDYrijMkxJSRRDh33evD7rqRzISlccxuJCXc5WCzcpCrOdZdz2CJqyjnt62gtVIdGYneL31YfugyZQbrniE4aH0yhIVpPxb/fDlN4JMZWxSqsmGlYMdPQWuzN55nPi7AHj0BrMeGAz9uTSffLxXlTQVOmYl8JHp1cntYVNCrH+OM3YsGfSrAq1sTi4SlBnp4TCbJfFGRyVfTKNr1GiamuWd1Yw3KMhg6KDiB9r4o1bipyD386jg/7jqR33LYeFcWVN0yJPD+c9WFHZITvi86lt1uaXnf1fGLVexSAyfp8ecOUE5Rvfg4aw28v4UPycDxnKtKz7ZCbQtzGrhu7IUaUnYGOcD416VXm//HHny0ZZAFognpTT9GAtVgsFovFYtkON/I+yby14f1hAAAAAElFTkSuQmCC"},{"name":"images/mask.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAPoAQMAAAB3bUanAAAAA1BMVEUAAACnej3aAAAAAXRSTlMavYQhHAAAAKpJREFUeNrswYEAAAAAgKD9qRepAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABg9uBAAAAAAADI/7URVFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWlPTgkAAAAABD0/7UrbAAAAADMAuw/AAGdJWCbAAAAAElFTkSuQmCC"},{"name":"images/message.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABR2lDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8bAwiDKwMlgzCCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsgs5s9hjZ7O05RmlJ+vD3R6pYWpHgVwpaQWJwPpP0CcllxQVMLAwJgCZCuXlxSA2B1AtkgR0FFA9hwQOx3C3gBiJ0HYR8BqQoKcgewbQLZAckYi0AzGF0C2ThKSeDoSG2ovCPD4uPopBBiZF+oaGhBwLumgJLWiBEQ75xdUFmWmZ5QoOAJDKVXBMy9ZT0fByMDIiIEBFOYQ1Z+DwGHJKLYPIZa/hIHB4hsDA/NEhFjSFAaG7W0MDBK3EGIq8xgY+FsYGLYdKkgsSoQ7gPEbS3GasRGEzWPPwMB69///zxoMDOwTGRj+Tvz///fi////Lgaaf5uB4UAlAHHtX+KqIbafAAAAbGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAJAAAAABAAAAkAAAAAEAAqACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAAAse6u2AAAACXBIWXMAABYlAAAWJQFJUiTwAAAEOUlEQVR4Ae2az08TQRTH2W5LsVWQmlYgWgxHTv4JHo0JNw+eSDQYDBgSTlw5e+RAJCEcPJnISRL16B9gPHojWClYqaUB2kpLt/XzJXijo4UNdONMMnnzY/fN933fm9lN5nV12WIZsAxYBiwDlgHLgGXAMmAZ+C8ZcP5itbO2tnal0Wi46+vrvdFoNKT6l3cudfro6Kh+eHjYGBkZKYVCIW9sbOwXgJqtQBkJWFpaiqHkHgQMOY4z3mw2EyiKUTuVhDrYfoJ1F7mKzIH94+TkZIX+qSV86ujJYDgcdj3PG6B7i5pGYQISrtI2Enfy+mUID4wxMF7DcbeFs1qtmm00oazX61dR+JBnhlF6E9mNZKgz7QebC8YktR/PPwFnJhKJfKC/Tz21GNmBRRel/SjqR0aoTcayCO9UbZc8KLwYPgje6AnmfY2ZYBkJIHxcGBSjSYx2UZpF4SP6WZPSS5y7Bc7XVG3ZuCqHojFcjQT09PR0cQbomTDGyy55PjsxMZFRp9PK8vKyIOkckNRBHZINptKpp7kJs69zlgBf6QygMhsBAXSar5BtBPhKZwCV2QgIoNN8hWwjwFc6A6jMRkAAneYrZBsBvtIZQGU2AgLoNF8h2wjwlc4AKrMREECn+QrZRoCvdAZQmY2AADrNV8jGm6F2Vpqfnw+Njo46uVwurltlbmdi3NNddD6BrsR0n9nF+nXayhUwmuELASzorKysxAuFQm88Hr/PddogYw+4R+ylfWH5BBgt43U5quuxPJbnSegwXuSelwBnYWGhe3FxMeK67gD1OgDusLgIUD5BL/LC8gmIOHm+wZpHGF+kXVS2iCkEzkWAjI/FYqMsrCSK5yycwuPDyCj9Y8/TBofxgtaEr6051tFiZeouON7w8jfwHZiUtE0AisPs9+50Ot2H4crGkKeHkNp/ukpXUoXDXJExj21QY6xljo4J3Bnm5P2KCEDqKj9HkoevW8BFaTKVSsUh4hmLDCHvAlS5RH3I4+tzAOTJK3hF/wdEfGGuegZjzvQKOQ0NVTAesLY3Pj6uJKmWpa0IwOAwdRDjqii/Q3sA41JIZY+UWeUX/U3kDvNfae+wBzMzMzMXRkBLS1tMtEUAnr2BoS8wTntNp63eryELGLvK3Bb9t/T3tra2DhKJhIfx2gIdW9oiACuUKaJkKe3pEAbL+O+0dyElQ3ublJTt6enpEmOBKG39CmOwQ41TRdwnvP6OM+ApPz6Py+Xyq2Kx+H5qakpbITDFGAH6i2K/1zFYf1XH31g8vYenS4xtIrNU7fnC7OxsiXZzbm4uMMYLqJEA/UVhaB7D9F1X2cXbL5Hb/PR8plY2Njb26DdkvB4IWjESUKvV6kSADrY/31J923W650ql0k4nn+7/6ggjAclkMk95jsHHyYb6reTPaq9SqXT86f6vBNjnLAOWAcuAZcAy8B8z8Bssn82VApnYswAAAABJRU5ErkJggg=="},{"name":"images/qun_empty_img_bg.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.forum/images/qun_empty_img_bg.png"},{"name":"images/square-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAA2CAYAAABjhwHjAAAACXBIWXMAACE4AAAhOAFFljFgAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAAGTklEQVR4Ae1azXITRxDunhW2ktOeUsVfWJ/BIJ4A8QR2nsDiCTAHbMLF8iUFzsH2E1g8AfAEFk/gjU2qcrMSjKniJC62bGun071aSfuvkbWuVAV9B6yd3Z2db7qnp78eAKaYYooppvjOgXDFqLz44gB4VQ3oEMGd4R1qI+I3pdGFH8+abn2uDQUDRw1Ma1ok1DwotCMDKpVa7m8/uanvPf9a0egtAFKNgBwwG4hLSNsWWE331fUWFIBUcpX6oe2dzu4wmUXIB882NgH1exkUXzse0Rq/V4XJ0LBQrU9KMpXc/OpnJgY1+I+BpOr7G9fX4ZJIkBNX9EgfQgHgztuE6KKG99xn07Os9l9sDfGMTqdsl6DrKG1VSMECUJa1sWkhPrmMFRPk5lf+WQS03oaeaFyAGszecEC6wjP7KG1NCSmNertU7m6ZBgqZ1C50a4qspZQ+W+ymj8clmCT34qgGhDvDJ+jJwatbjcRgnh9VPIW7/NMOt3PwWR+HVKJf8Rzw6tzRUuzW2ARVvMHyIBIBkaCSOgClxLoDYjxLLSb2+OOr2/VJwroMniezhkTPYrccTfqtuLRpXwly7u+3hNxgcAS4FO+QIyJbbOg6QkzxrDKxJhSE/Y1bW7wNPYyOBSocxddM+1BpjYiwHbq0wx3eX/mylkasqL0pjD95otkbfom20vK9F5+qJu+n73PLvM/NzkjEHFhMXK4EpVbcallrskjcXzla5qi7GWpqHby+OTfqvVTLuVtz7Zj1ZM/ZYWKbUWLQuGpiAnFRP1kYwvED3wiozBud8y0EbIU7jGcsVmiLuGoQetFvkVoa9U5ubnmXw71KCffBm2y1m0+gYEjw0iezNVBkSw7rbtx41783v3q8G07teGuYy1vrKu9DsqA5JKdah0C/gYLhbzGns3ucQG+ygljzkN4GqaAP3pbeh5+XpD6vv1xyAvF32ZgTL+rSIygYvKZ3IJmd1OZ/PfZJqPOzRvgGT0I1r7+R5ASlTncr3saE671toUhQJb2ZFuSPH+iiceAB5MCIHJTLqR8tmiAPvJ3eDn8PvgkUzqAcyIEZuRwIQV7oY6VF2Z3p7XiTJOEKVGNwjfQtfL+n9NNhRM7TF3bsgzEFTove6cxe3odM0F/fA9dDbCpNsewn4pa5KJk8ZKlrbdZjg2spB4gs4Y097JKiA3dZMj072Pj5HVwSknjzn3rmA0S2aenHzC09L7IWeGYdGURKFHVECxYfaIbgRP5OpKHcyVQgZuRYQUc/0KtiBQQfxyJYL9Csfp7YTdOAsa1Cn5SfZj1rRC7w+SFBgmr/p8gchZgkKPJE3NQgBzSFJPRsuUjkzovY40TLZui3E7aKkN9/fWOOs5Z4tHNE1UuWUYQVvfK11IzEj9hSHonBmBwSfghfa9C1+DMfX99eFgmEyYhWYyvu3V85XoZJQLiQeQ+txAQakwtSn6EqJniatreJBBI3ZZLx3NOWnJGteFh5+bUCYyIY+MA6IpJjW5LdS99CYwZD9FKfyIBt3ZlJtUS/DpJhRcfzLvbGdVW2fGRd8UStcwVAVHoo2FE1rNLHylAUWpEcUzL3uy+PMq2QY0WBuOqhCckgKNX612I16VsmMa5akKy10HPj4d7qJxaxKhx+W9YP5w9HVbxkwSOWNnPODlJL6EGReA/CmjJW2kjoPOvaQznHGDu3LJ1163GFrk9ndkfllpK1SETNcFVB2JJVGBCjqFjmlCxR2sCottTdrv/+2ORk7XlaR3y9V3Izyy37rpqmEQPU/P2RA09aCdECTKj/4BBmAFLkS6FLqQJR6GyBRNHUdNMW15PsRsoEsh4xEhSG/cWFqwSRtHSLK9TV8DWvQ185THT4mCi9D7uXwwtZP00wgFj8QnuLbFEJBiOlk7g1e0ur9xucxDoO1uTEJ6sjAkWLS4RvWI81ecbdeNDx12mnzGkaH1QC1sCA2CiI6+4HNc2JyQmChb9jcOjY7qttngwhYo8YaYP/cbKPt+KPR6vfhZDrQ9xUNJ7pUXEmOCISeOv9swf/pPfEqqLiozPARyiaDnFYDSfgKh182N+4EdmHr+TAvxdUuGhK5sfH/kElr1Uuvm4XdaByJeT6iMw44QP+mu3POkjkE/ekFmr8QyvP5TM99yr+R8MUU0wxxRRT/F/xL1Y0QnnxLkydAAAAAElFTkSuQmCC"},{"name":"images/text-channel.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAACXBIWXMAACE4AAAhOAFFljFgAAABZWlDQ1BEaXNwbGF5IFAzAAB4nHWQvUvDUBTFT6tS0DqIDh0cMolD1NIKdnFoKxRFMFQFq1OafgltfCQpUnETVyn4H1jBWXCwiFRwcXAQRAcR3Zw6KbhoeN6XVNoi3sfl/Ticc7lcwBtQGSv2AijplpFMxKS11Lrke4OHnlOqZrKooiwK/v276/PR9d5PiFlNu3YQ2U9cl84ul3aeAlN//V3Vn8maGv3f1EGNGRbgkYmVbYsJ3iUeMWgp4qrgvMvHgtMunzuelWSc+JZY0gpqhrhJLKc79HwHl4plrbWD2N6f1VeXxRzqUcxhEyYYilBRgQQF4X/8044/ji1yV2BQLo8CLMpESRETssTz0KFhEjJxCEHqkLhz634PrfvJbW3vFZhtcM4v2tpCAzidoZPV29p4BBgaAG7qTDVUR+qh9uZywPsJMJgChu8os2HmwiF3e38M6Hvh/GMM8B0CdpXzryPO7RqFn4Er/QfBIQM2AAACSElEQVR4Ae2ZzU7bQBDHZ+wIyC3Xfsq5l8h9A/MGfYMmT9ByaMktyS3lUniC8gh9hLwBFuGOJSLgho8I4h1mIYBl1klkr4kd7e9gyburXY/+O7vjGQCDwWAwGAylA+d1tvaufgBEbQJwoUTwR/uEdDgefjyaM0ZN6/dlj1D0ocQg4e7J/vsDZZ+q0f151og2N66h/IR2/bbp95thsqOmHL615QKJ59dH6cGHMkDo8MObvTWmNzXpJqPksBosNdf8/fyWbHcnbf4gb9E4C9YUY1jVWFvDljo8VLjdSwdy4A/fBVAgmQyTRkUkziAHX7rnO6fDTyMoCONjVSOzjwHiCHJAFoZQIJkMmzn+DpQY42NVwxwecXTcY2mM/3xA0IDZilUj8z2GiAGUmDz3WBNKjPGxqmEMqxrGsKqhPu6jKAQrFtkQ9rb3Lr7DAmzEzqJchix0EIhvkBUiZ5lhasPu7gLY3JA/go1Zi8MzOrCQ9DDvMb6kfwSRB5rg1YJxSt5EuRX9A07yI+2CJqRKHDQfx3LuWuDU+yCtLzXykLl6ziQFCHYPHxRTzUwNelH1Fe6viRtZ1l+VSnlCMl4z4DkH87JcuX4RWt3JERE++56NVvPJx9Lqa7xgSBR1xvuf/0OBZE/mpMC+5E1JsEriVRWU2w7t+rSvqmfpRqthRKLHVbV2chtIJxcoOkUmSJNovcekUck2qZJVv/36lkZJtG/FJ1ahUpxCIo9VqRRHq2KrVilOPsXES8Gdj/bBqlXSCl/iXt5amcGwxtwDkkfZNYLnKt4AAAAASUVORK5CYII="}],
        fonts: {"size.10":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":10,"bold":false,"weight":0,"italic":false},"size.11":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":11,"bold":false,"weight":0,"italic":false},"size.12":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":12,"bold":false,"weight":0,"italic":false},"size.13":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":13,"bold":false,"weight":0,"italic":false},"bold.12":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":12,"bold":true,"weight":0,"italic":false},"size.14":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":14,"bold":false,"weight":0,"italic":false},"bold.13":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":13,"bold":true,"weight":0,"italic":false},"bold.14":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":14,"bold":true,"weight":0,"italic":false},"size.16":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":16,"bold":false,"weight":0,"italic":false},"bold.16":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":16,"bold":true,"weight":0,"italic":false},"size.17":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":17,"bold":false,"weight":0,"italic":false},"bold.17":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":17,"bold":true,"weight":0,"italic":false},"bold.21":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":21,"bold":true,"weight":0,"italic":false},"size.30":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":30,"bold":false,"weight":0,"italic":false},"size.40":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":40,"bold":false,"weight":0,"italic":false},"size.50":{"fontFamily":"Heiti SC,Heiti TC,Helvetica,sans-serif,Microsoft YaHei","size":50,"bold":false,"weight":0,"italic":false}},
        appVersion: "1.3.3.1",
        buildVersion: "20240731145339",
        styles: {"feed-wrap-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","marginBottom":"10","padding":"0 13 0 13"},"feed-wrap-no-img-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","marginTop":"8","marginBottom":"5","padding":"0 13 0 13"},"emoji-95":{"display":"flex","height":"16","width":"16"},"emoji-margin-95":{"display":"flex","height":"16","width":"16","margin":"0 0 3 0"},"feed-title-wrap-95":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","flexWrap":"wrap","justifyContent":"flex-start","marginBottom":"2.5"},"feed-title-wrap-android-95":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","flexWrap":"wrap","justifyContent":"flex-start","marginBottom":"2"},"feed-title-95":{"display":"flex","width":"100%","height":"auto"},"feed-multi-title-95":{"display":"flex","width":"100%"},"feed-content-95":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","flexWrap":"wrap"},"feed-content-text-95":{"display":"flex","width":"auto","height":"auto","margin":"0 0 -2 0"},"feed-content-margin-95":{"display":"flex","width":"auto","height":"auto","margin":"0 0 5 0"},"forum-header-wrap-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","padding":"0 13 0 13"},"forum-header-wrap-android-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","padding":"0 13 0 13"},"forum-header-95":{"display":"flex","height":"auto","width":"100%","flexDirection":"row","alignItems":"center","margin":"0 0 4 0"},"header-left-95":{"display":"flex","width":"24","height":"24","marginRight":"6"},"header-image-95":{"display":"flex","flexDirection":"row","height":"auto","width":"100%"},"header-right-95":{"display":"flex","width":"auto","height":"auto","flex":"1","flexDirection":"column"},"header-right-top-95":{"display":"flex","width":"100%","flexDirection":"row","alignItems":"center","position":"relative"},"header-right-top-has-emoji-android-95":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","position":"relative"},"header-right-top-android-95":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","margin":"0 0 0 0"},"left-text-95":{"display":"flex","flexShrink":"0","width":"auto","height":"auto"},"guild-name-95":{"display":"flex","width":"auto","height":"auto"},"guild-name-has-emoji-95":{"display":"flex","width":"auto","height":"auto","marginTop":"-2"},"guild-name-has-emoji-android-95":{"display":"flex","width":"auto","height":"auto","marginTop":"0"},"space-95":{"display":"flex","width":"1","height":"11","margin":"0 6 0 6"},"header-right-guild-name-95":{"display":"flex","width":"auto","height":"auto"},"channel-name-95":{"display":"flex","width":"auto","height":"auto"},"channel-name-has-emoji-95":{"display":"flex","width":"auto","height":"auto","marginTop":"-2"},"channel-name-has-emoji-android-95":{"display":"flex","width":"auto","height":"auto","marginTop":"0"},"header-right-bottom-95":{"display":"flex","width":"auto","height":"auto"},"publish-95":{"display":"flex","width":"auto"},"publish-has-emoji-95":{"display":"flex","width":"auto","height":"auto","marginTop":"-2"},"publish-has-emoji-android-95":{"display":"flex","width":"auto","height":"auto"},"forum-space-95":{"height":"0.5","width":"100%"},"forum-space-android-95":{"display":"flex","height":"0.5","width":"100%"},"image-wrap-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"row","justifyContent":"flex-start","marginBottom":"8"},"image-wrap-three-95":{"flexShrink":"0","position":"relative","display":"flex","flexDirection":"row-reverse","height":"auto","width":"100%","justifyContent":"space-between","marginBottom":"8"},"pro-feed-image-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","marginBottom":"8"},"video-icon-wrap-95":{"display":"flex","justifyContent":"center","alignItems":"center","position":"absolute","height":"100%","width":"100%","left":"0","top":"0","bottom":"0","right":"0"},"video-icon-95":{"width":"40","height":"40"},"pro-feed-image-wrap-95":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","position":"relative"},"record-wrap-95":{"flexShrink":"0","display":"flex","width":"auto","height":"auto","flexDirection":"column","margin":"0 13 0 13"},"record-wrap-qun-95":{"flexShrink":"0","display":"flex","width":"auto","height":"auto","flexDirection":"column"},"record-content-95":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","marginBottom":"6.8"},"record-left-wrap-95":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","padding":"0 3 0 0","marginRight":"5.8"},"record-image-95":{"display":"flex","width":"16","height":"16","marginRight":"5"},"record-image-95-none":{"display":"none","width":"0","height":"0","marginRight":"0"},"record-space-95":{"display":"flex","width":"1","height":"10","marginRight":"7"},"record-right-wrap-95":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","marginRight":"4"},"record-images-wrap-95":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","marginRight":"1"},"record-images-wrap-95-none":{"display":"none","width":"0","height":"0","flexDirection":"row","marginRight":"0"},"record-content-image-95":{"display":"flex","height":"16","width":"16","marginRight":"1"},"record-images-count-wrap-95":{"display":"flex","width":"auto","height":"auto"},"record-like-title":{"display":"flex","width":"auto","height":"auto"},"record-images-count-95":{"display":"flex","width":"auto","height":"auto"},"record-message-wrap-AttributeName":{"display":"flex","width":"auto","height":"auto","marginRight":"4"},"record-message-wrap-AttributeName-none":{"display":"none","width":"0","height":"0","marginRight":"0"},"message-count-95":{"display":"flex","width":"auto","height":"auto"},"comment-wrap-95":{"flexShrink":"0","display":"flex","width":"100%","height":"auto","flexDirection":"column","padding":"0 13 4 13"},"comment-content-space-95":{"display":"flex","width":"100%","height":"0.33","marginBottom":"6"},"comment-content-space-android-95":{"display":"flex","width":"100%","height":"0.5","marginBottom":"6"},"comment-item-wrap-95":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row","marginBottom":"2"},"comment-item-wrap-android-95":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row","marginBottom":"3"},"comment-item-wrap-no-margin-95":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row"},"comment-item-left-95":{"display":"flex","width":"auto","height":"auto","marginRight":"4"},"comment-item-nick-95":{"display":"flex","width":"auto","height":"auto"},"comment-item-right-95":{"display":"flex","flex":"1","height":"auto"},"emoji-feed-wrap-95":{"display":"flex","height":"auto","width":"100%"},"emoji-feed-content-95":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","flexWrap":"wrap"},"emoji-feed-content-text-95":{"display":"flex","height":"auto","width":"100%"},"forum-container-95":{"display":"flex","flexDirection":"row","width":"100%","height":"auto","minHeight":"50","maxHeight":"1000"},"forum-wrap-95":{"display":"flex","flex":"1","flexDirection":"column","height":"auto","minHeight":"50","padding":"4 0 4 0"},"security-text-95":{"display":"flex","width":"100%","height":"auto"},"forum-wrap-no-padding-95":{"display":"flex","flex":"1","flexDirection":"column","height":"auto","padding":"0"},"forum-wrap-android-95":{"display":"flex","flex":"1","flexDirection":"column","height":"auto","minHeight":"50","padding":"13 0 8 0"},"qun-feed-wrap-95":{"display":"flex","flexDirection":"column","height":"auto","width":"100%","maxHeight":"1000"},"qun-feed-content-wrap-95":{"display":"flex","flexDirection":"column","height":"auto","padding":"12 12 0 12","width":"100%"},"qun-feed-header-95":{"display":"flex","flexDirection":"row","alignItems":"center","height":"auto","width":"100%","marginBottom":"5"},"qun-feed-header-left-95":{"display":"flex","height":"16","width":"16","marginRight":"4"},"qun-feed-header-right-95":{"display":"flex","height":"auto","width":"100%"},"qun-pro-nick-95":{"display":"flex","height":"auto","width":"100%"},"qun-feed-title-wrap-95":{"display":"flex","flexDirection":"column","height":"auto","width":"100%","marginBottom":"0","justifyContent":"flex-start"},"feed-title-second-wrap-95":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","marginBottom":"0","justifyContent":"flex-start"},"qun-feed-text-95":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","alignItems":"center","marginBottom":"0"},"qun-feed-emoji-record-95":{"display":"flex","height":"auto","width":"100%","marginTop":"8"},"qun-feed-image-wrap-95":{"display":"flex","height":"auto","width":"100%","padding":"6 0 8 0","marginBottom":"0"},"qun-feed-image-95":{"display":"flex","height":"164.4","width":"100%","position":"relative","marginBottom":"0"},"qun-feed-tag-wrap-95":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","padding":"6 12 0 12"},"qun-feed-tag-95":{"display":"flex","flexDirection":"row","height":"auto","width":"100%"},"qun-foot-view-95":{"display":"flex","flexDirection":"column","height":"auto","width":"auto","padding":"0 0 0 0"},"qun-foot-space-view-95":{"display":"flex","width":"auto","height":"0.5","marginTop":"0"},"qun-foot-share-business-95":{"display":"flex","flexDirection":"row","alignItems":"center","width":"auto","margin":"4.8 0 7 0"},"qun-business-icon-95":{"display":"flex","width":"12","height":"12","marginRight":"4","marginTop":"2"},"qun-business-name-95":{"display":"flex","width":"auto","height":"auto"},"qun-feed-img-empty-wrap-95":{"display":"flex","width":"92%","height":"86%","maxHeight":"86%","position":"absolute","top":"12","left":"12"},"qun-feed-img-empty-text-95":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","alignItems":"center","marginBottom":"0","padding":"0 20 0 20"},"feed-wrap":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","marginBottom":"5"},"emoji":{"display":"flex","height":"16","width":"16"},"emoji-margin":{"display":"flex","height":"16","width":"16","margin":"0 0 3 0"},"feed-title-wrap":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","flexWrap":"wrap","justifyContent":"flex-start","marginBottom":"5"},"feed-title-wrap-android":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","flexWrap":"wrap","justifyContent":"flex-start","marginBottom":"2"},"feed-title":{"display":"flex","width":"100%","height":"auto"},"feed-multi-title":{"display":"flex","width":"100%"},"feed-content":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","flexWrap":"wrap"},"feed-content-text":{"display":"flex","width":"auto","height":"auto"},"feed-content-margin":{"display":"flex","width":"auto","height":"auto","margin":"0 0 5 0"},"forum-header-wrap":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","padding":"0 0 6 0"},"forum-header-wrap-android":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"column","padding":"0 0 8 0"},"forum-header":{"display":"flex","height":"auto","width":"100%","flexDirection":"row","alignItems":"center","margin":"0 0 6 0"},"header-left":{"display":"flex","width":"30","height":"30","marginRight":"6"},"header-image":{"display":"flex","flexDirection":"row","height":"auto","width":"100%"},"header-right":{"display":"flex","width":"auto","height":"auto","flex":"1","flexDirection":"column"},"header-right-top":{"display":"flex","width":"100%","flexDirection":"row","alignItems":"center","position":"relative"},"header-right-top-has-emoji-android":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","position":"relative"},"header-right-top-android":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","margin":"0 0 0 0"},"left-text":{"display":"flex","flexShrink":"0","width":"auto","height":"auto"},"guild-name":{"display":"flex","width":"auto","height":"auto"},"guild-name-has-emoji":{"display":"flex","width":"auto","height":"auto","marginTop":"-2"},"guild-name-has-emoji-android":{"display":"flex","width":"auto","height":"auto","marginTop":"0"},"space":{"display":"flex","width":"1","height":"11","margin":"0 6 0 6"},"header-right-guild-name":{"display":"flex","width":"auto","height":"auto"},"channel-name":{"display":"flex","width":"auto","height":"auto"},"channel-name-has-emoji":{"display":"flex","width":"auto","height":"auto","marginTop":"-2"},"channel-name-has-emoji-android":{"display":"flex","width":"auto","height":"auto","marginTop":"0"},"header-right-bottom":{"display":"flex","width":"auto","height":"auto"},"publish":{"display":"flex","width":"auto"},"publish-has-emoji":{"display":"flex","width":"auto","height":"auto","marginTop":"-2"},"publish-has-emoji-android":{"display":"flex","width":"auto","height":"auto"},"forum-space":{"display":"flex","height":"0.33","width":"100%"},"forum-space-android":{"display":"flex","height":"0.5","width":"100%"},"link-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","justifyContent":"center","alignItems":"center","margin":"0 1 1 1","padding":"1 3 1 3"},"link-wrap-margin":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","justifyContent":"center","alignItems":"center","margin":"0 1 3 1","padding":"1 3 1 3"},"link-text-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row"},"link-text":{"display":"flex","width":"auto","height":"auto"},"link-image":{"display":"flex","width":"16","height":"16"},"link-image-none":{"display":"flex","width":"0","height":"0"},"group-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","justifyContent":"center","alignItems":"center","margin":"0 1 1 1","padding":"1 3 1 3"},"group-wrap-margin":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","justifyContent":"center","alignItems":"center","margin":"0 1 3 1","padding":"1 3 1 3"},"group-text-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row"},"group-text":{"display":"flex","width":"auto","height":"auto"},"group-image":{"display":"flex","width":"12","height":"12"},"group-image-none":{"display":"flex","width":"0","height":"0"},"group-image-wrap":{"display":"flex","width":"12","height":"12","marginRight":"1"},"guild-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","justifyContent":"center","alignItems":"center","margin":"0 1 1 1","padding":"1 3 1 3"},"guild-wrap-margin":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","justifyContent":"center","alignItems":"center","margin":"0 1 3 1","padding":"1 3 1 3"},"guild-text-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row"},"guild-text":{"display":"flex","width":"auto","height":"auto"},"guild-image":{"display":"flex","width":"13","height":"13","marginRight":"2"},"guild-image-none":{"display":"flex","width":"0","height":"0"},"image-wrap":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","flexDirection":"row","justifyContent":"flex-start","marginBottom":"8"},"image-wrap-three":{"flexShrink":"0","position":"relative","display":"flex","height":"auto","width":"100%","justifyContent":"space-between","marginBottom":"8"},"pro-feed-image":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","marginBottom":"8"},"video-icon-wrap":{"display":"flex","justifyContent":"center","alignItems":"center","position":"absolute","height":"100%","width":"100%","left":"0","top":"0","bottom":"0","right":"0"},"video-icon":{"width":"40","height":"40"},"pro-feed-image-wrap":{"flexShrink":"0","display":"flex","height":"auto","width":"100%","position":"relative"},"extra-len-wrap":{"display":"flex","width":"100%","height":"auto"},"extra-len-wrap-content":{"display":"flex","width":"24","height":"18"},"extra-len-wrap-content-2":{"display":"flex","width":"30","height":"18"},"extra-len-wrap-content-3":{"display":"flex","width":"36","height":"18"},"extra-len-text-wrap":{"display":"flex","justifyContent":"center","alignItems":"center","width":"auto","padding":"4 4 4 4"},"extra-len-text":{"display":"flex","width":"auto","height":"auto"},"record-wrap":{"flexShrink":"0","display":"flex","width":"auto","height":"auto","flexDirection":"column"},"record-content":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","marginBottom":"6.8"},"record-left-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","padding":"0 3","marginRight":"5.8"},"record-image":{"display":"flex","width":"16","height":"16","marginRight":"5"},"record-image-none":{"display":"none","width":"0","height":"0","marginRight":"0"},"record-space":{"display":"flex","width":"1","height":"10","marginRight":"7"},"record-right-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","alignItems":"center","marginRight":"4"},"record-images-wrap":{"display":"flex","width":"auto","height":"auto","flexDirection":"row","marginRight":"1"},"record-images-wrap-none":{"display":"none","width":"0","height":"0","flexDirection":"row","marginRight":"0"},"record-content-image":{"display":"flex","height":"16","width":"16","marginRight":"1"},"record-images-count-wrap":{"display":"flex","width":"auto","height":"auto"},"record-images-count":{"display":"flex","width":"auto","height":"auto"},"message-count":{"display":"flex","width":"auto","height":"auto"},"comment-wrap":{"flexShrink":"0","display":"flex","width":"100%","height":"auto","flexDirection":"column","padding":"0 0 4 0"},"comment-content-space":{"display":"flex","width":"100%","height":"0.33","marginBottom":"6"},"comment-content-space-android":{"display":"flex","width":"100%","height":"0.5","marginBottom":"6"},"comment-item-wrap":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row","marginBottom":"2"},"comment-item-wrap-android":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row","marginBottom":"3"},"comment-item-wrap-no-margin":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row"},"comment-item-left":{"display":"flex","width":"auto","height":"auto","marginRight":"4"},"comment-item-nick":{"display":"flex","width":"auto","height":"auto"},"comment-item-right":{"display":"flex","flex":"1","height":"auto"},"emoji-feed-wrap":{"display":"flex","height":"auto","width":"100%"},"emoji-emoji":{"display":"flex","height":"16","width":"16"},"emoji-feed-content":{"display":"flex","flex":"1","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","flexWrap":"wrap"},"emoji-feed-content-text":{"display":"flex","height":"auto","width":"100%"},"qun-feed-wrap":{"display":"flex","flexDirection":"column","height":"auto","width":"100%","maxHeight":"1000"},"qun-feed-content-wrap":{"display":"flex","flexDirection":"column","height":"auto","padding":"12 12 4 12","width":"100%"},"qun-feed-header":{"display":"flex","flexDirection":"row","alignItems":"center","height":"auto","width":"100%","marginBottom":"5"},"qun-feed-header-left":{"display":"flex","height":"20","width":"20","marginRight":"4"},"qun-feed-header-right":{"display":"flex","height":"auto","width":"100%"},"qun-pro-nick":{"display":"flex","height":"auto","width":"100%"},"qun-feed-title-wrap":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","marginBottom":"0","justifyContent":"flex-start"},"qun-feed-text":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","alignItems":"center","marginBottom":"0"},"qun-feed-image-wrap":{"display":"flex","height":"auto","width":"100%","padding":"6 0 8 0","marginBottom":"0"},"qun-feed-image":{"display":"flex","height":"134","width":"100%","position":"relative","marginBottom":"0"},"qun-feed-tag-wrap":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","padding":"6 12 6 12"},"qun-feed-tag":{"display":"flex","flexDirection":"row","height":"auto","width":"100%"},"preview-feed-wrap":{"display":"flex","flexDirection":"column","height":"auto","width":"100%","maxHeight":"1000"},"preview-feed-content-wrap":{"display":"flex","flexDirection":"column","height":"auto","padding":"10 12 0 12","width":"100%"},"preview-feed-header":{"display":"flex","flexDirection":"row","alignItems":"center","height":"auto","width":"100%","marginBottom":"3"},"preview-feed-header-left":{"display":"flex","height":"16","width":"16","marginRight":"4"},"preview-left-text":{"display":"flex","flexShrink":"0","width":"auto","height":"auto"},"preview-header-right-guild-name":{"display":"flex","width":"auto","height":"auto"},"preview-channel-name":{"display":"flex","width":"auto","height":"auto"},"preview-header-image":{"display":"flex","flexDirection":"row","height":"auto","width":"100%"},"preview-feed-header-right":{"display":"flex","height":"auto","width":"100%","alignItems":"center"},"preview-pro-nick":{"display":"flex","height":"auto","width":"100%"},"preview-feed-title-wrap":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","marginBottom":"4","justifyContent":"flex-start"},"preview-feed-text":{"display":"flex","flexDirection":"row","height":"auto","width":"100%","alignItems":"center","marginBottom":"0"},"preview-feed-image-wrap":{"display":"flex","height":"auto","width":"100%","marginBottom":"0"},"preview-feed-image":{"display":"flex","height":"121","width":"100%","position":"relative","marginBottom":"0"},"preview-feed-tag-wrap":{"display":"flex","flexDirection":"row","alignItems":"center","height":"auto","width":"100%","padding":"6 12 6 12"},"channel-image":{"display":"flex","width":"14","height":"14","margin":"0 4 0 0"},"preview-feed-tag":{"display":"flex","flexDirection":"row","alignItems":"center","height":"auto","width":"100%"},"empty-wrap":{"display":"flex","width":"100%","height":"auto","flexDirection":"row","alignItems":"center","padding":"6 2 7 0"},"empty-left":{"display":"flex","width":"100%","height":"auto","flexDirection":"column"},"empty-title":{"display":"flex","width":"100%","height":"auto","margin":"0 0 3 0"},"empty-sub-title":{"display":"flex","width":"100%","height":"auto","margin":"0 0 15 0"},"empty-content-left":{"display":"flex","width":"100%","height":"auto","alignItems":"center"},"empty-emoji-icon":{"display":"flex","flexShrink":"0","width":"14","height":"14","marginRight":"5"},"empty-content":{"display":"flex","width":"100%","height":"auto","alignItems":"center"},"empty-left-text":{"display":"flex","flexShrink":"0","width":"auto","height":"auto"},"empty-space":{"display":"flex","flexShrink":"0","width":"1","height":"11","margin":"0 6 0 6"},"empty-channel-name":{"display":"flex","width":"auto","height":"auto"},"empty-right":{"display":"flex","flexShrink":"0","width":"60","height":"60"},"empty-channel-icon":{"display":"flex","width":"60","height":"60"},"c2c-container":{"display":"flex","flexDirection":"column","flexShrink":"1","height":"auto","width":"100%","maxHeight":"1000"},"c2c-main":{"display":"flex","height":"auto","width":"100%","flexDirection":"column","padding":"12 12 12 12"},"c2c-emoji":{"display":"flex","width":"16","height":"16"},"c2c-main-title-wrap":{"display":"flex","height":"auto","width":"100%","marginBottom":"8"},"c2c-main-title":{"display":"flex","height":"auto","width":"100%"},"c2c-desc":{"display":"flex","height":"auto","width":"100%","flexDirection":"row","alignItems":"flex-start"},"c2c-desc-text-wrap":{"display":"flex","height":"auto","width":"100%","flexDirection":"row","flexWrap":"wrap","alignItems":"center","justifyContent":"flex-start","margin":"0 8 0 0"},"c2c-desc-text-view":{"display":"flex","width":"auto","height":"auto"},"c2c-desc-image-wrap":{"flexShrink":"0","display":"flex","height":"60","width":"60"},"c2c-desc-image":{"display":"flex","height":"60","width":"60"},"c2c-tag":{"display":"flex","height":"30","width":"auto","padding":"0 0 0 12"},"c2c-tag-title":{"display":"flex","height":"auto","width":"auto"},"container":{"display":"flex","flexDirection":"column","width":"400","minHeight":"320","maxHeight":"2000"}},
        applicationEvents: [{"eventName":"OnCreateView","callback":"app.OnCreateView"},{"eventName":"OnDestroyView","callback":"app.OnDestroyView"},{"eventName":"OnStartup","callback":"app.OnStartup"},{"eventName":"OnConfigChange","callback":"app.OnConfigChange"}],
        applicationId: appKey + '_' + uniqueApplicationId,
        urlWhiteList: [".qq.com",".gtimg.cn",".qpic.cn",".qlogo.cn","h5.qzone.qq.com",".gtimg.com","qzonestyle.gtimg.cn"]
      };
    };

    /**
     * 释放资源
     * @description 使用_命名,防止被重写
     */
    ArkWindow._destroyResource_ = function () {
      ArkGlobalContext.clearTemplates();
    };

    function createApp(options) {
      const templates = ArkGlobalContext.getViewTemplates();
      return new arkWeb.WebARKView({
        /**
         * 这里之前是导出的唯一的对象.不过后面发现不可行.因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
         * @author alawnxu
         * @date 2022-07-30 22:41:12
         * @see
         * com.tencent.qq_vip_collect_card_template
         * <Event>
         *  <OnSetValue value="gameLogic.OnSetData" />
         * </Event>
         *
         * 而游戏中心的大部分都是:
         * com.tencent.gamecenter.gshare
         * <Event>
         *  <OnSetValue value="Vark.onSetMetaData" />
         * </Event>
         *
         * 还有多个的:
         * com.tencent.mobileqq.reading
         * <OnSetValue value="bookUpdate.OnSetMetadata" name="OnSetValue"></OnSetValue>
         * <OnSetValue value="accountChange.OnSetMetadata" name="OnSetValue"></OnSetValue>
         *
         * 而根据不同的模板调用不同的初始化方法在正常不过.所以这里统一导出ArkWindow
         */
        app: ArkWindow,
        templates,
        ...(options || {}),
      });
    }

    return createApp;

}));
