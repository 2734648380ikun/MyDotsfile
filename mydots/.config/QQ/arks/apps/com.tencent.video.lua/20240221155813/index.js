(function (global, factory) {
      // 重写factory方法.让factory有独立的作用域
      var _factory = factory; factory = function(arkWeb, wasmoon) { return function(options) { return _factory(arkWeb, wasmoon)(options); }};
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@tencent/ark-web'), require('wasmoon')) :
  typeof define === 'function' && define.amd ? define(['@tencent/ark-web', 'wasmoon'], factory) :
  (global.Ark = factory(global.WebArk, global.wasmoon));
})(this, (function (arkWeb, wasmoon) {
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var arkWeb__namespace = /*#__PURE__*/_interopNamespace(arkWeb);

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
      const apis = [];
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

  ArkGlobalContext._setViewTemplate('video', `<View id="video" metadatatype="video" style="video">
	<Event>
  	<OnResize value="app.OnResize" name="OnResize"></OnResize>
  	<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
    <OnClick value="app.OnClick" name="OnClick"></OnClick>
    <OnActivate value="app.OnActivate" name="OnActivate"></OnActivate>
	</Event>
  <View style="video-wrapper" id="videoWrapper">
      <Texture id="bgColor" color="0xFF272727"></Texture>
      <Image style="video-bg-image" mode="aspectfill" metadatatype="preview"></Image>
      <View style="video-top-tag" id="videoTopWrapper">
        <View style="video-top-wrapper" radius="12,12,12,12">
          <Texture color="0x80000000"></Texture>
          <Text style="video-top-tag-text" lineheight="20" ellipsis="true" font="subText" textcolor="0xFFFFFFFF" metadatatype="tag"></Text>
          <Image style="video-top-tag-icon" id="videoTopTagIcon" mode="aspectfill" metadatatype="tagIcon"></Image>
        </View>
      </View>
      <Image style="video-play-icon" mode="aspectfill" value="res/image/play-icon.png"></Image>
      <View style="video-bottom-wrapper">
          <View style="video-bottom-cover">
              <Image id="coverImage" value="res/image/bottom-cover.png" style="height: 100%;width: 100%"></Image>
          </View>
          <View style="video-bottom-content-bar">
              <Text style="video-bottom-title-text" ellipsis="true" lineheight="22" font="fs-15" textcolor="0xFFFFFFFF" metadatatype="title"></Text>
          </View>
          <View style="video-bottom-title-bar">
              <Image style="video-bottom-title-avatar" mode="aspectfill" radius="8,8,8,8" metadatatype="avatar"></Image>
              <Text style="video-bottom-title-text" ellipsis="true" lineheight="16" font="subText" textcolor="0xFFFFFFFF" metadatatype="nickname"></Text>
              <Image style="video-bottom-title-icon" id="videoBottomTitleIcon" mode="aspectfill" radius="2,2,2,2" metadatatype="sourcelogo"></Image>
          </View>
      </View>
  </View> 
</View>
`);

  const code$8 = `
          

THEME = {
    COLOR_BACKGROUND = 'bubble_guest',
}


COLOR_SCHEME_DEFAULT = {
    [THEME.COLOR_BACKGROUND] = 0xFFFFFFFF,
}

COLOR_SCHEME_DEFAULT_NIGHT = {
    [THEME.COLOR_BACKGROUND] = 0xFF262626,
}
          _G['constant'] = {
            THEME = THEME,COLOR_SCHEME_DEFAULT = COLOR_SCHEME_DEFAULT,COLOR_SCHEME_DEFAULT_NIGHT = COLOR_SCHEME_DEFAULT_NIGHT
          }
        `;

  const code$7 = `
          
function compass(data)
    if data.chatType == "-1" then
        return
    end
    local http = Net.HttpRequest()
    
    local uin = QQ.GetUIN()
    local os = System.GetOS();
    local version = QQ.GetVersion()
    local feedid = get_feedid(data.jumpURL)
    
    local reqUrl = 'https://h5.qzone.qq.com/v2/wezone/trpc/DataReport?uin=' .. uin .. '&g_tk=' ..
                       hash_func(QQ.GetPskey('qzone.qq.com') or QQ.GetSkey())
    
    local reportData = {
        dcid = 5504,
        report_data = {{
            key = "uin",
            value = uin
        }, {
            key = "qua",
            value = "ark"
        }, {
            key = "app_version",
            value = version
        }, {
            key = "platform",
            value = os
        }, {
            key = "os_version",
            value = os
        }, {
            key = "respond_type",
            value = "ark"
        }, {
            key = "page_id",
            value = "2"
        }, {
            key = "actiontype",
            value = "96"
        }, {
            key = "subactiontype",
            value = tostring(data.type)
        }, {
            key = "thr_action",
            value = "0"
        }, {
            key = "ext1",
            value = "0"
        }, {
            key = "ext2",
            value = "1"
        }, {
            key = "ext3",
            value = tostring(data.chatType)
        }, {
            key = "ext5",
            value = "0"
        }, {
            key = "ext6",
            value = feedid
        }, {
            key = "ext9",
            value = "1"
        }, {
            key = "touin",
            value = tostring(data.toUin)
        }}
    }
    reqParams = {
        dcdata = {reportData}
    }
    http:SetCookie('uin=' .. uin .. '; p_skey=' .. QQ.GetPskey('qzone.qq.com') .. '; p_uin=' .. uin)
    http:SetHeader('Content-Type', 'application/json')
    http:Post(reqUrl, reqParams)
end


function get_feedid(url)
    local feedid = ''

    -- %E5%B0%8F%E4%B8%96%E7%95%8Cark%E6%9C%89%E9%83%A8%E5%88%86%E5%AD%98%E9%87%8F%E6%95%B0%E6%8D%AE%EF%BC%8C%E8%BF%99%E9%87%8C%E5%85%9C%E5%BA%95%E5%88%A4%E6%96%AD%E4%B8%80%E4%B8%8B
    local isXsj = string.find(url, "xsj.qq.com")
    if isXsj then
        local schema = get_param(url, "schema")
        local jumpSchema = url_decode(schema)
        feedid = jumpSchema:match("feedid=([^&]+)")
    else
        feedid = url:match("feedid=([^&]+)")
    end

    if feedid then
        return feedid
    else
        return ""
    end
end

function url_decode(str)
    str = string.gsub(str, "+", " ")
    str = string.gsub(str, "%%(%x%x)", function(h)
        return string.char(tonumber(h, 16))
    end)
    return str
end

function get_param(url, target_key)
    local query_start = string.find(url, "?")

    if query_start then
        local query_string = string.sub(url, query_start + 1)
        for param in string.gmatch(query_string, "([^&]+)") do
            local key, value = string.match(param, "([^=]+)=([^=]+)")
            if key == target_key then
                return value
            end
        end
    end

    return nil
end

function hash_func(skey)
    local str = skey or ''
    local hash = 5381

    for i = 1, #str do
        local char = str:sub(i, i)
        hash = hash + ((hash << 5) + char:byte())
    end

    return hash & 0x7fffffff
end

          _G['report'] = {
            compass = compass,get_feedid = get_feedid,url_decode = url_decode,get_param = get_param,hash_func = hash_func
          }
        `;

  const code$6 = `
          timerId = 0
timerMap = {}
function CreateTimer(func,ms)
    local timer = Timer();
    timerId = timerId+1
    local _timerId = tostring(timerId)
    timerMap[_timerId] = timer;
    timer:SetInterval(ms);
    timer:AttachEvent("OnTimer", function (timer) 
        func(timer,_timerId);
    end)
    timer:Start();
    return _timerId;
end

function SetTimeout(func,ms)
    local _timerId = CreateTimer(function(timer,_timerId) 
        func();
        timer:Stop();
        timerMap[_timerId] = nil
    end, ms);
    return _timerId
end

function ClearTimer(_timerId)
    utils.log(_timerId)
    local timer = timerMap[_timerId];
    if (timer) then
       timer:Stop();      
      timerMap[_timerId] = nil
    end
end
          _G['timer'] = {
            timerId = timerId,timerMap = timerMap,CreateTimer = CreateTimer,SetTimeout = SetTimeout,ClearTimer = ClearTimer
          }
        `;

  const code$5 = `
          function log(text)
    Console.Log(tostring(text))
    if QQ and QQ.Log then
        QQ.Log(tostring(text))
    end
end

function isEmpty(val)
    return val == nil or val == ""
end
          _G['utils'] = {
            log = log,isEmpty = isEmpty
          }
        `;

  const code$4 = `
          
local ThemeID = {
    ConciseWhite = "2971",          
    ConciseGray  = "2921",          
    ConciseBlack = "2920",          
    
    DefaultDefault = "2100",        
    AndroidDefaultBlack = "1103",   
    iOSDefaultBlack = "1102",       
   
    ConciseGreen  = "3063",         
    ConciseYellow = "3064",         
    ConcisePurple = "3065",         
    ConcisePink   = "3066",         
    ConciseRed    = "3067",         
    
    TIMDefault = "1015712",         
}

local COLOR_SCHEME_DEFAULT = constant.COLOR_SCHEME_DEFAULT
local COLOR_SCHEME_DEFAULT_NIGHT = constant.COLOR_SCHEME_DEFAULT_NIGHT

function getThemeColorConfig()    
    local theme = app.getAppConfig('theme')
    local token = app.getAppConfig('token')
    if theme == nil then 
        utils.log("theme config is nil")
        return nil
    end

    if token == nil then
        utils.log("token config is nil")
        return nil
    end
    return token 
end

function format(colorStr)
    if colorStr == nil then
        utils.log("colorStr is nil")
        return nil
    end 
    local firstChar = string.sub(colorStr,1,1)
    
    if firstChar ~= '#' then
        colorStr = '#'..colorStr
    end
    if string.find(colorStr, '^#%x%x%x%x%x%x%x%x$') == nil and 
       string.find(colorStr, '^#%x%x%x%x%x%x$') == nil and 
       string.find(colorStr, '^#%x%x%x$') == nil then
        utils.log("colorStr is invalid")
        return nil
    end
    local str = string.sub(colorStr,2,string.len(colorStr)) 
    local len = string.len(str)
    if(len==3) then
        
        local strIndex1 = string.sub(str,1,1) 
        local strIndex2 = string.sub(str,2,2) 
        local strIndex3 = string.sub(str,3,3) 
        str = strIndex1..strIndex1..strIndex2..strIndex2..strIndex3..strIndex3
    end
    if len==6 then
        str = 'FF'..str
    end
    
    
    local num = tonumber(str,16)
    return num
end

function getDefaultColor(keyName)
    if isDarkTheme() then
        return COLOR_SCHEME_DEFAULT_NIGHT[keyName]
    else
        return COLOR_SCHEME_DEFAULT[keyName]
    end
end

function getThemeColorValue(keyName,colorConfig)
    
    if colorConfig == nil then
        return getDefaultColor(keyName)
    end
    utils.log('colorConfig['..keyName..']')
    utils.log(colorConfig[keyName])
    local formatColorVal = format(colorConfig[keyName])
    local res = formatColorVal or getDefaultColor(keyName)
    return res
end

function isDarkTheme()
    
    

    local theme = app.getAppConfig('theme')
    
    if theme == nil then 
        return false
    end

    local mode = theme["mode"]
    local themeId = theme["themeId"]
    
    
    if themeId == ThemeID.iOSDefaultBlack 
        or themeId == ThemeID.AndroidDefaultBlack then
        return true
    end
    
    
    if mode ~= nil and mode == "concise" then
        if themeId == ThemeID.ConciseBlack then
            return true
        end
    end
    
    return false
end
          _G['theme'] = {
            ThemeID = ThemeID,COLOR_SCHEME_DEFAULT = COLOR_SCHEME_DEFAULT,COLOR_SCHEME_DEFAULT_NIGHT = COLOR_SCHEME_DEFAULT_NIGHT,getThemeColorConfig = getThemeColorConfig,format = format,getDefaultColor = getDefaultColor,getThemeColorValue = getThemeColorValue,isDarkTheme = isDarkTheme
          }
        `;

  const code$3 = `
          
function IsInAIO(view) 
    local info = QQ.GetContainerInfo(view) 
    if not info then
        return false
    end
    
    local chatType = info["ChatType"]
    if chatType == nil or chatType == 0 or chatType == -1 or
        chatType == "0" or chatType == "-1" then
        return false
    end
    return true
end
          _G['qqutil'] = {
            IsInAIO = IsInAIO
          }
        `;

  const code$2 = `
          function SetColor(elem, color)
    if elem == nil then
        return
    end
        
    local elemType = elem:GetType()
    if elemType == "Texture" then
        elem:SetValue(color)
    elseif elemType == "Text" then
        elem:SetTextColor(color)
    else
        utils.log("unknown element type: " .. elemType)
    end     
end



          _G['uiutil'] = {
            SetColor = SetColor
          }
        `;

  const code$1 = `
          local viewModels = { }


local appConfig = nil

function getAppConfig(key)
    if appConfig == nil then 
        return nil
    end
    return appConfig[key]
end
function getThemeConfig()
    if appConfig == nil then 
        return nil
    end
    return appConfig["theme"]
end


function GetModel(view)
    while(view~=view:GetRoot())
    do
        if viewModels[view] then
            break
        else
            view = view:GetParent()
        end
    end
    
    local model = viewModels[view]
    if model and model.GetModel then 
        return model:GetModel()
    end
    return model
end

function OnCreateView(view, template)
    utils.log("app.OnCreateView template=" .. template .. ", view=" .. tostring(view))
    
    if type(_G[template]) == "table" or type(_G[template]) == "userdata" then
        local model = _G[template].ViewModel:New(view)
        viewModels[view] = model
        model:Initialize(view)
    else
        app.log("OnCreateView.FatalError: No View Model for "..template)
    end
end


function OnSetMetadata(sender, value)
    utils.log("app.OnSetMetadata.sender=" .. tostring(sender))
    
    local obj = app.GetModel(sender)
    if obj == nil then
        return
    end

    obj:OnSetMetadata(value)
end

function OnDestroyView(view, template)
    while(view~=view:GetRoot())
    do
        if viewModels[view] then
            break
        else
            view = view:GetParent()
        end
    end
    viewModels[view]:Deinitialize()
    viewModels[view] = nil
end

function OnActivate(sender, active)
    local model = app.GetModel(sender)
    if model == nil or model.OnActivate == nil then return end
    model:OnActivate(view, active)
end

function OnResize(sender, srcWidth, srcHeight, dstWidth, dstHeight)
    local model = app.GetModel(sender)
    if model == nil or model.OnResize == nil then return end
    model:OnResize(dstWidth, dstHeight)
end

function OnClick(sender, x, y, button, keyState)
    local model = app.GetModel(sender)
    if model == nil or model.OnClick == nil then
        utils.log("app.OnClick, model not found, sender=" .. tostring(sender))
        return 
    end
    utils.log("app.OnClick, sender=" .. tostring(sender) 
        .. ", model=" .. tostring(model))
    model:OnClick(sender)
end

function OnTouchStart(sender, x, y, button, keyState)
    local model = app.GetModel(sender)
    if model == nil or model.OnClick == nil then
        return 
    end
    model:OnTouchStart(sender, x)
end

function OnCustomEvent(sender, event, data)
    local model = app.GetModel(sender)
    if model == nil then return end
    model:OnCustomEvent(sender, event, data)
end

function GetAppName()
    return "video.lua"
end

local debugEnable = true
function debug(msg)
    if debugEnable == true then
        Console.Log(GetAppName()..msg)
    end
end

function log(msg)
    Console.Log(GetAppName()..msg)
end

function OnConfigChange(config)
    utils.log("app.OnConfigChange appconfig="..Net.TableToJSON(config))
    if config then
        appConfig = config
    else
        utils.log("app.OnConfigChange, config is nil")
    end
    for view, model in pairs(viewModels) do
        if model ~= nil and model.OnConfigChange ~= nil then
            utils.log("app.OnConfigChange, view=" .. tostring(view) .. ", model=" .. tostring(model))
            model:OnConfigChange(config)
        else
            utils.log("app.OnConfigChange, no model, appconfig="..Net.TableToJSON(config))
        end
    end
end 

function OnStartup(config)
        if config then
          appConfig = config
        end
        
    utils.log("app.OnStartup appconfig="..Net.TableToJSON(config))
    if config then
        appConfig = config
    else
        utils.log("app.OnStartup, config is nil")
    end
    for _, model in pairs(viewModels) do
        if model ~= nil and model.OnStartup ~= nil then
            model:OnStartup(config)
        end
    end
end


function GetAppId()
    return 'com.tencent.video.lua'
end

          _G['app'] = {
            viewModels = viewModels,appConfig = appConfig,getAppConfig = getAppConfig,getThemeConfig = getThemeConfig,GetModel = GetModel,OnCreateView = OnCreateView,OnSetMetadata = OnSetMetadata,OnDestroyView = OnDestroyView,OnActivate = OnActivate,OnResize = OnResize,OnClick = OnClick,OnTouchStart = OnTouchStart,OnCustomEvent = OnCustomEvent,GetAppName = GetAppName,debugEnable = debugEnable,debug = debug,log = log,OnConfigChange = OnConfigChange,OnStartup = OnStartup,GetAppId = GetAppId
          }
        `;

  const code = `
          ViewModel = {}

function ViewModel:New(view)
    local obj = {}
    setmetatable(obj, self)
    self.__index = self
    return obj
end

function ViewModel:Initialize(view)
    self.view = view
    self.views = {}
    self.views['videoWrapper'] = self.view:GetUIObject("videoWrapper")
    self.views['bgColor'] = self.views['videoWrapper']:GetTexture("bgColor")
    self.views['videoBottomCanvas'] = self.view:GetUIObject("videoBottomCanvas")
    self.views['videoTopWrapper'] = self.view:GetUIObject("videoTopWrapper")
    self.views['videoTopTagIcon'] = self.view:GetUIObject("videoTopTagIcon")
    self.views['videoBottomTitleIcon'] = self.view:GetUIObject("videoBottomTitleIcon")

    self.hasSetMetaData = false
end

function ViewModel:OnResize(width, height)
    utils.log("onResize-->" .. "width-->" .. width .. "height-->" .. height)
    self.width = width
end

function ViewModel:OnClick()
    
    if QQ.GetBizsrc == nil or appConfig.bizsrc == "smallworld.feed" then
        report.compass({
            type = "2",
            chatType = QQ.GetContainerInfo(self.view).ChatType,
            jumpURL = self.metaData["jumpURL"],
            toUin = self.metaData["ark_reserved1"]
        })
    end
    local system = System.GetOS()
    local jumpURL = ''
    if system == "Android" or system == "iOS" or self.metaData['pcJumpUrl'] == nil then
        jumpURL = self.metaData['jumpURL']
    else
        jumpURL = self.metaData['pcJumpUrl']
        utils.log(111)
        utils.log(jumpURL)

    end
    self:Jump(jumpURL)
end

function ViewModel:Jump(url)
    utils.log('jump to ' .. url)
    local rootView = self.view:GetRoot();

    
    local isXsj = string.find(url, "xsj.qq.com")
    if isXsj then
        local system = System.GetOS()
        if system == "Android" or system == "iOS" then
            local schema = get_param(url, "schema")
            local jumpSchema = url_decode(schema)
            QQ.OpenUrl(jumpSchema, rootView)
        else
            QQ.OpenUrl(url, rootView)
        end
    else
        QQ.OpenUrl(url, rootView)
    end

end

function url_decode(str)
    str = string.gsub(str, "+", " ")
    str = string.gsub(str, "%%(%x%x)", function(h)
        return string.char(tonumber(h, 16))
    end)
    return str
end

function get_param(url, target_key)
    local query_start = string.find(url, "?")

    if query_start then
        local query_string = string.sub(url, query_start + 1)
        for param in string.gmatch(query_string, "([^&]+)") do
            local key, value = string.match(param, "([^=]+)=([^=]+)")
            if key == target_key then
                return value
            end
        end
    end

    return nil
end

function ViewModel:OnSetMetadata(value)
    utils.log("set meta: " .. Net.TableToJSON(value))
    if self.hasSetMetaData then
        return
    end
    self.hasSetMetaData = true
    self.metaData = value["video"]
    self:UpdateValue()
    self:UpdateStyle()
    self:ApplyTheme()

    
    if QQ.GetBizsrc == nil or appConfig.bizsrc == "smallworld.feed" then
        report.compass({
            type = "1",
            chatType = QQ.GetContainerInfo(self.view).ChatType,
            jumpURL = self.metaData["jumpURL"],
            toUin = self.metaData["ark_reserved1"]
        })
    end
end

function ViewModel:UpdateValue()
    
end

function ViewModel:UpdateStyle()
    self:EmptyValAdapter()
    self:UpdateDefaultStyle()
end

function ViewModel:UpdateDefaultStyle()
    local inAio = qqutil.IsInAIO(self.view)
    local system = System.GetOS()
    utils.log("ark width-->" .. self.width)
    
    if inAio then
        
        if system == "Android" then
            if self.metaData["isHorizontal"] == true then
                self.width = Device.GetScreenWidth() - 180
                self.height = self.width * 0.75
            else
                self.height = Device.GetScreenWidth() - 180
                self.width = self.height * 0.625
            end
        elseif system == "iOS" then
            if self.metaData["isHorizontal"] == true then
                
                self.width = math.max(250, (267 * Device.GetScreenWidth() / 390)) * (194 / 218) + 24
                self.height = self.width * 0.75
            else
                self.height = Device.GetScreenWidth() * 0.68
                self.width = self.height * 0.625
            end
        else
            
            if self.metaData["isHorizontal"] == true then
                self.width = 280
                self.height = self.width * 0.75
            else
                self.height = 280
                self.width = self.height * 0.625
            end
        end
    else
        if self.metaData["isHorizontal"] == true then
            self.height = self.width * 0.75
        else
            self.height = Device.GetScreenWidth() * 0.68
            self.width = self.height * 0.625
        end
    end
    local defaultStyle = "display:flex;flexDirection:column;height:" .. self.height .. ";width:" .. self.width ..
                             ";alignItems:center"
    utils.log("style-->" .. defaultStyle)
    self.view:SetStyle(defaultStyle)
end


function ViewModel:EmptyValAdapter()
    local tagIcon = self.metaData['tagIcon']
    local tag = self.metaData['tag']
    local sourcelogo = self.metaData['sourcelogo']
    if utils.isEmpty(tag) then
        self.views['videoTopWrapper']:SetStyle("width:0")
    end
    if utils.isEmpty(tagIcon) then
        self.views['videoTopTagIcon']:SetStyle("width:0")
    end
    if utils.isEmpty(sourcelogo) then
        self.views['videoBottomTitleIcon']:SetStyle("width:0")
    end
end

function ViewModel:ApplyTheme()
    
end

function ViewModel:OnConfigChange(config)
    utils.log("OnConfigChange appconfig=" .. Net.TableToJSON(config))
    self:ApplyTheme()
end


          _G['video'] = {
            ViewModel = ViewModel,url_decode = url_decode,get_param = get_param
          }
        `;

  async function luaRun() {
    if (WebArk && (!WebArk.LuaAdapter)) {
      throw new Error('[ArkRender] LuaAdapter not found');
    }
    let factory = await WebArk.LuaAdapter.getLuaFactory();
    if (!factory) {
      factory = new wasmoon.LuaFactory();
    }
    const lua = await factory.createEngine();
    Object.keys(arkWeb__namespace).forEach((key) => {
      // console.warn('aaa WebArk key', key)
      ArkWindow[key] = WebArk[key];
      if (key === 'Net') {
          ArkWindow[key] = Net;
      }
      if (key === 'UI') {
        ArkWindow[key] = UI;
        lua.global.set("jsProxyUI", UI);
      } else {
        lua.global.set(key, ArkWindow[key]);
      }
    });
    lua.global.set('ArkWindow', ArkWindow);
    lua.global.set('JSCreateView', (view) => {
        view = view.split('.')[0];
        const newView = CreateView(view);
        return newView;
    });
    const luaUIObjectInject = `
  LuaJSView2LuaViewMap = {

  }

  LuaUIObject = {
  }
  function LuaUIObject:SetID(id)
    Console.Log('aaa lua proxy SetID', id)
    return self.jsUIObject.SetID(id);
  end
  function LuaUIObject:New(jsUIObject)
    -- TODO: delete jsuiobject
    Console.Log('aaa LuaUIObject:New', LuaJSView2LuaViewMap[jsUIObject.hashId], jsUIObject)
    if LuaJSView2LuaViewMap[jsUIObject.hashId] then
      return LuaJSView2LuaViewMap[jsUIObject.hashId]
    end
    local model = {}
    setmetatable(model, self)
    self.__index = self
    model.jsUIObject = jsUIObject
    LuaJSView2LuaViewMap[jsUIObject.hashId] = model
    return model
  end

  -- Pos Start
  function LuaUIObject:SetPos(x, y)
    return self.jsUIObject.SetPos(x, y)
  end
  function LuaUIObject:GetPos()
    local pos = self.jsUIObject.GetPos()
    return pos.x, pos.y
  end

  -- Pos End

  function CreateLinearGradient(x1, y1, x2, y2)
    return self.jsUIObject.CreateLinearGradient(x1, y1, x2, y2);
  end

  function SetFillStyle(gradient)
    return self.jsUIObject.SetFillStyle(gradient);
  end

  function Fill()
    return self.jsUIObject.Fill();
  end

  function Rectangle(left, top, w, h)
    return self.jsUIObject.Rectangle(left, top, w, h);
  end

  function LuaUIObject:GetID()
    return self.jsUIObject.GetID();
  end

  function LuaUIObject:SetID(id)
    return self.jsUIObject.SetID(id);
  end

  function LuaUIObject:GetSize()
    local size = self.jsUIObject.GetSize();
    return size.width, size.height
  end

  function LuaUIObject:SetSize(width,height)
    return self.jsUIObject.SetSize(width,height);
  end

  function LuaUIObject:SetAutoSize(autoSize)
    return self.jsUIObject.SetAutoSize(autoSize);
  end

  function LuaUIObject:SetRadius(left, top, right, bottom)
    return self.jsUIObject.SetRadius(left, top, right, bottom);
  end

  function LuaUIObject:GetRadius()
    local radius = self.jsUIObject.SetRadius();
    return radius.left, radius.top, radius.right, radius.bottom;
  end

  function LuaUIObject:GetUIObject(id)
    local jsView = self.jsUIObject.GetUIObject(id)
    Console.Log('[ArkBuilder] LuaUIObject:GetUIObject jsView type:'..type(jsView))
    if type(jsView) == 'nil' then
      return nil
    end
    if jsView and LuaJSView2LuaViewMap[jsView.hashId] then
        Console.Log('[ArkBuilder] LuaUIObject:GetUIObject jsView cache:',LuaJSView2LuaViewMap[jsView.hashId])
      return LuaJSView2LuaViewMap[jsView.hashId]
    end
    return LuaUIObject:New(jsView)
  end

  function LuaUIObject:GetTexture(textureName)
    return self.jsUIObject.GetTexture(textureName);
  end

  function LuaUIObject:HitTest(x, y)
    return self.jsUIObject.HitTest(x, y);
  end

  function LuaUIObject:GetLayered()
    return self.jsUIObject.GetLayered();
  end

  function LuaUIObject:SetLayered()
    return self.jsUIObject.SetLayered();
  end

  function LuaUIObject:GetController()
    return self.jsUIObject.GetController();
  end


  function LuaUIObject:GetTemplate()
    return self.jsUIObject.GetTemplate()
  end

  function LuaUIObject:GetRoot()
    local rootView = self.jsUIObject.GetRoot();
    if rootView and LuaJSView2LuaViewMap[rootView.hashId] then
      return LuaJSView2LuaViewMap[rootView.hashId]
    end
    return LuaUIObject:New(rootView)
  end

  function LuaUIObject:GetParent()
    Console.Log('[ArkBuilder] LuaUIObject:GetParent start')
    if self.jsUIObject then
      local parentView = self.jsUIObject.GetParent()
      Console.Log('[ArkBuilder] LuaUIObject:GetParent ing:', parentView)
      if parentView and LuaJSView2LuaViewMap[parentView.hashId] then
        return LuaJSView2LuaViewMap[parentView.hashId]
      else
        return LuaJSView2LuaViewMap[self.jsUIObject.hashId]
      end
    end
  end

  function LuaUIObject:MeasureTextSize()
    Console.Log('aaa MeasureTextSize start'..type(self.jsUIObject))
    if self.jsUIObject and self.jsUIObject.MeasureTextSize then
      local size = self.jsUIObject.MeasureTextSize();
      return size.width, size.height
    end
    Console.Warn('[ArkBuilder] warn LuaUIObject MeasureTextSize is nil')
    return 0, 0
  end

  function LuaUIObject:AddChild(view)
    Console.Log('aaa Lua AddChild', view)
    return self.jsUIObject.AddChild(view)
  end

  function LuaUIObject:InsertChild(pos, child)
    return self.jsUIObject.InsertChild(pos, child)
  end

  function LuaUIObject:DeleteChild(view)
    Console.Log('aaa DeleteChild view', view)
    return self.jsUIObject.DeleteChild(view.jsUIObject)
  end

  function LuaUIObject:DeleteChild(view)
    Console.Log('aaa Lua DeleteChild', view)
    return self.jsUIObject.DeleteChild(view)
  end

  function LuaUIObject:SetAnchors(anchors, update)
    return self.jsUIObject.SetAnchors(anchors, update)
  end

  -- Margin Start
  function LuaUIObject:SetMargin(top, right, bottom, left)
    return self.jsUIObject.SetMargin(top, right, bottom, left)
  end

  function LuaUIObject:GetMargin()
    local margin = self.jsUIObject.GetMargin()
    return margin.left, margin.top, margin.right, margin.bottom
  end

  -- Margin End

  function LuaUIObject:AttachEvent(event, fn)
    return self.jsUIObject.AttachEvent(event,fn)
  end

  function LuaUIObject:SetVisible(visible)
    return self.jsUIObject.SetVisible(visible)
  end

  function LuaUIObject:GetVisible()
    return self.jsUIObject.GetVisible()
  end

  function LuaUIObject:SetRootSize(view, width, height)
    if LuaJSView2LuaViewMap[view.hashId] then
      return self.jsUIObject.SetRootSize(LuaJSView2LuaViewMap[view.hashId], width, height)
    end
  end

  function LuaUIObject:SetValue(value)
    return self.jsUIObject.SetValue(value, true)
  end

  function LuaUIObject:GetValue()
    return self.jsUIObject.GetValue()
  end

  function LuaUIObject:GetMetadata()
    return self.jsUIObject.GetMetadata()
  end

  function LuaUIObject:GetFont()
    return self.jsUIObject.GetFont()
  end

  function LuaUIObject:GetMetadataType()
    return self.jsUIObject.GetMetadataType();
  end

  function LuaUIObject:GetFloating()
    return self.jsUIObject.GetFloating()
  end

  function LuaUIObject:GetFloating()
    return self.jsUIObject.GetFloating()
  end

  function LuaUIObject:GetRelativePos()
    return self.jsUIObject.GetRelativePos()
  end

  function LuaUIObject:SetFont(value)
    Console.Log('aaa LuaUIObject:SetFont')
    return self.jsUIObject.SetFont(value)
  end

  function LuaUIObject:GetLineHeight()
    return self.jsUIObject.GetLineHeight()
  end

  function LuaUIObject:SetLineHeight(height)
    return self.jsUIObject.SetLineHeight(height)
  end

  function LuaUIObject:SetMaxline(value)
    return self.jsUIObject.SetMaxline(value)
  end

  function LuaUIObject:LockUpdate()
    return self.jsUIObject.LockUpdate()
  end

  function LuaUIObject:UnlockUpdate()
    return self.jsUIObject.UnlockUpdate()
  end

  function LuaUIObject:Update()
    return self.jsUIObject.Update()
  end

  function LuaUIObject:ClearChildren()
    return self.jsUIObject.ClearChildren()
  end

  function LuaUIObject:SetRect(left, top, right, bottom)
    return self.jsUIObject.SetRect(left, top, right, bottom)
  end

  function LuaUIObject:SetStretch(stretch)
    return self.jsUIObject.SetStretch(stretch)
  end

  function LuaUIObject:GetType()
    return self.jsUIObject.GetType()
  end

  function LuaUIObject:GetChild()
    return self.jsUIObject.GetChild()
  end

  function LuaUIObject:GetFirstChild()
    return self.jsUIObject.GetFirstChild()
  end

  function LuaUIObject:GetLastChild()
    return self.jsUIObject.GetLastChild()
  end

  function LuaUIObject:GetNextChild()
    return self.jsUIObject.GetNextChild()
  end

  function LuaUIObject:GetPrevChild()
    return self.jsUIObject.GetPrevChild()
  end

  function LuaUIObject:SetMode(mode)
    return self.jsUIObject.SetMode(mode)
  end

  function LuaUIObject:GetMode()
    return self.jsUIObject.GetMode()
  end

  function LuaUIObject:SetTextColor(color)
    return self.jsUIObject.SetTextColor(color)
  end

  function LuaUIObject:SetEllipsis(value)
    return self.jsUIObject.SetEllipsis(value)
  end

  function LuaUIObject:SetAlign(value)
    return self.jsUIObject.SetAlign(value)
  end

  function LuaUIObject:IsType(type)
    return self.jsUIObject.IsType(type)
  end

  function LuaUIObject:GetStyle()
    return self.jsUIObject.GetStyle()
  end

  function LuaUIObject:SetStyle(style)
    return self.jsUIObject.SetStyle(style)
  end

  function LuaUIObject:SetMultiline(isMultiline)
    return self.jsUIObject.SetMultiline(isMultiline)
  end

  function LuaUIObject:DetachEvent(event)
    return self.jsUIObject.DetachEvent(event)
  end

  function LuaUIObject:GetRect()
    local rect = self.jsUIObject.GetRect()
    return rect.left, rect.top, rect.right, rect.bottom
  end

  -- canvas Start
  function LuaUIObject:ClearRect(x,y,width,height)
    return self.jsUIObject.ClearRect(x,y,width,height)
  end

  function LuaUIObject:Save()
    return self.jsUIObject.Save()
  end

  function LuaUIObject:DrawImage(image, left, top, iconWidth, iconHeight)
    return self.jsUIObject.DrawImage(image, left, top, iconWidth, iconHeight)
  end

  function LuaUIObject:SetDrawStyle(color)
    return self.jsUIObject.SetDrawStyle(color)
  end

  function LuaUIObject:DrawCircle(x, y, length)
    return self.jsUIObject.DrawCircle(x, y, length)
  end

  function LuaUIObject:Restore()
    return self.jsUIObject.Restore()
  end
  -- Canvas End

  -- UI start
  UI = {
  }

  function UI:View()
    local jsProxyObj = jsProxyUI.View()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  function UI:Text()
    Console.Log('UI:Text start')
    local jsProxyObj = jsProxyUI.Text()
    Console.Log('UI:Text jsProxyObj', jsProxyObj)
    local model = LuaUIObject:New(jsProxyObj)
    Console.Log('UI:Text model', model)
    return model
  end

  function UI:Image()
    local jsProxyObj = jsProxyUI.Image()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  function UI:Canvas()
    local jsProxyObj = jsProxyUI.Canvas()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  function UI:Video()
    local jsProxyObj = jsProxyUI.Video()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  -- UI end
  `;
    let finalCode = '';
    const moduleIdList = [];
    
        



            finalCode = finalCode + code$8;
            moduleIdList.push('constant');
          

            finalCode = finalCode + code$7;
            moduleIdList.push('report');
          

            finalCode = finalCode + code$6;
            moduleIdList.push('timer');
          

            finalCode = finalCode + code$5;
            moduleIdList.push('utils');
          

            finalCode = finalCode + code$4;
            moduleIdList.push('theme');
          

            finalCode = finalCode + code$3;
            moduleIdList.push('qqutil');
          

            finalCode = finalCode + code$2;
            moduleIdList.push('uiutil');
          

            finalCode = finalCode + code$1;
            moduleIdList.push('app');
          

            finalCode = finalCode + code;
            moduleIdList.push('video');
          
        const applicationViewEvents = {};
          applicationViewEvents['video'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnActivate",
      "callback": "app.OnActivate"
  }];
        
        
    /** 注入app的注册事件 */
    applicationViewEvents['app'] = [{"eventName":"OnCreateView","callback":"app.OnCreateView"},{"eventName":"OnExit","callback":"app.OnExit"},{"eventName":"OnStartup","callback":"app.OnStartup"},{"eventName":"OnConfigChange","callback":"app.OnConfigChange"},{"eventName":"OnActivate","callback":"app.OnActivate"}];
    /**
     * getSupportProxyEventNameTemplates
     * @params eventName 事件名称
     * @params host 事件宿主
     * */
    const getSupportProxyEventNameTemplates = (eventName, host, callbackName) => {
      host = host || '_ENV._G';
      callbackName = callbackName || 'OnSetMetadata';
      const supportProxyEventNameTemplates = {
        OnSetValue: `
        function (sender, value)
          if type(value) ~= 'table' and type(value) ~= 'userdata' then
            Console.Log('LuaBridge: ${callbackName} value is not table')
            return
          end
          local luaView = LuaJSView2LuaViewMap[sender.hashId]
          if type(luaView) == 'nil' then
            luaView = LuaUIObject:New(sender)
          end
          local tableValue = {}
          Console.Log('LuaBridge:${callbackName} value', value)
          for k, v in pairs(value) do
            tableValue[k] = v
          end
          Console.Log('LuaBridge:${callbackName} jsonToTable', tableValue)
          ${host}['${callbackName}'](luaView, tableValue)
        end
      `,
        OnCreateView: `
        function (view, template)
          local luaView = LuaUIObject:New(view)
          ${host}['OnCreateView'](luaView, template)
        end
      `,
        OnConfigChange: `
      function (config)
        Console.Log('LuaBridge:OnConfigChange start config:', config)
        ${host}['${callbackName}'](config)
      end
      `,
        OnStartup: `
      function (config)
        Console.Log('LuaBridge:OnStartup start config:', config)
        ${host}['${callbackName}'](config)
      end
      `,
        OnActivate: `
      function (view, active)
        Console.Log('LuaBridge:OnActivate start view, active:', view, active)
        local luaView = LuaUIObject:New(view)
        ${host}['${callbackName}'](luaView, active)
      end
      `,
        OnClick: `
        function (sender)
          local luaView = LuaJSView2LuaViewMap[sender.hashId]
          if type(luaView) == 'nil' then
            luaView = LuaUIObject:New(sender)
          end
          Console.Log('LuaBridge:${callbackName} ${host} ${callbackName}')
          ${host}['${callbackName}'](luaView)
        end
      `,
        OnDestroyView: `
        function (view)
          local luaView = LuaUIObject:New(view)
          ${host}['${callbackName}'](luaView, template)
        end
      `,
        OnExit: `
        function ()
        ${host}['OnExit']()
        end
      `,
        OnResize: `
        function (sender, srcWidth, srcHeight, dstWidth, dstHeight)
          Console.Log('lua inject', sender, srcWidth, srcHeight, dstWidth, dstHeight)
          local luaView = LuaJSView2LuaViewMap[sender.hashId]
          if type(luaView) == 'nil' then
            luaView = LuaUIObject:New(sender)
          end
          ${host}['${callbackName}'](luaView, srcWidth, srcHeight, dstWidth, dstHeight)
        end
      `,
        // 'OnTouchStart',
        // 'OnTouchEnd',
        // 'OnTouchEnd',
      };
      return supportProxyEventNameTemplates[eventName];
    };
    // luaBridge对象构造
    const luaBridgeTemp = {};
    // luaBridge函数对象映射
    const luaBridgeFunctionMap = {};

    /**
     *
     * 替换对应Lua函数代码
     * @param {*} luaBridgeFunctionMap
     * @return {*}
     */
    const generateLuaBridgeInjectCode = (luaBridgeFunctionMap) => {
      const luaBridgeFunctionMapStr = JSON.stringify(luaBridgeFunctionMap);
        return luaBridgeFunctionMapStr.replace(/\"(\w)*\"(:|=)/g, (a) => {
          return a.replace(/\"/g, "").replace(/:/g, '=');
        }).replace(/\"|\\n/g, "");
    };
    /**
     * 将字符串数组转成深度对象
     * @params curObj 当前操作对象
     * @params eventCasts剩余数组
     */
    const listToDeepObj = function (curObj, eventCasts) {
      if (!eventCasts || eventCasts.length === 0) {
        return;
      }
      if (eventCasts.length === 1) {
        curObj[eventCasts[0]] = `__${eventCasts[0]}__`;
        return;
      }
      const cast = eventCasts.shift();
      curObj[cast] = {};
      listToDeepObj(curObj[cast], eventCasts);
    };
    Object.keys(applicationViewEvents).forEach((key) => {
      const viewEvents = applicationViewEvents[key];
      viewEvents && viewEvents.forEach((viewEvent) => {
        const { eventName, callback } = viewEvent;
        if (!getSupportProxyEventNameTemplates(eventName)) {
          return;
        }
        const eventCasts = callback.split('.');
        let tempHost = '';
        if (eventCasts.length < 2) {
          tempHost = '';
        }
        if (eventCasts.length === 2 && eventCasts[0] != 'app') {
          tempHost = eventCasts[0];
        }
        if (eventCasts.length > 2) {
          tempHost = eventCasts.slice(1,eventCasts.length-1).join('.');
        }
        const eventTemplate = getSupportProxyEventNameTemplates(eventName, tempHost, eventCasts[eventCasts.length-1]);
        const lastIdx = eventCasts.length - 1;
        const viewKey = tempHost || 'app';
        if (!luaBridgeFunctionMap[viewKey]) {
          luaBridgeFunctionMap[viewKey] = {};
        }
        luaBridgeFunctionMap[viewKey][eventCasts[lastIdx]] = eventTemplate;
        /**
         * {app: {OnSetMetaData: function}}
         */
        const bridgeItemKey = eventCasts.shift();
        if(!luaBridgeTemp[bridgeItemKey]) {
          luaBridgeTemp[bridgeItemKey] = {};
        }
        const eventCastObj = {};
        listToDeepObj(eventCastObj, eventCasts);
        Object.keys(eventCastObj).forEach((key)=>{
          luaBridgeTemp[bridgeItemKey][key] = eventCastObj[key];
        });
      });
    });
    const luaBridgeInject =  `
    LuaBridge = ${generateLuaBridgeInjectCode(luaBridgeFunctionMap)}
    _ENV._G['LuaBridge'] = LuaBridge
    -- 注入全局Bridge CreateView
    _ENV._G['CreateView'] = function(id)
      Console.Log('[ArkBuilder] Lua Bridge _G CreateView start id:'..id)
      local jsView = JSCreateView(id)
      Console.Log('[ArkBuilder] Lua Bridge _G CreateView:'..jsView.id)
      local luaView = LuaUIObject:New(jsView)
      return luaView
    end
  `;
    finalCode = `
    ${luaUIObjectInject}
    ${luaBridgeInject}
    ${finalCode}
  `;
    await lua.doString(finalCode);
    // 将app以及app内部字段依赖注入lua全局
    const luaGlobalWith = lua.global.get('_G');
    ArkWindow.app = luaGlobalWith['app'];
    // 注入其他依赖Lua模块
    moduleIdList.forEach((moduleId) =>{
      ArkWindow[moduleId] = luaGlobalWith[moduleId];
    });
    // 覆盖需要代理的类型
    const luaBridgeApi = luaGlobalWith['LuaBridge'];
    ArkWindow['LuaBridge'] = luaBridgeApi;
    if (ArkWindow.app && luaBridgeApi) {
      Object.keys(luaBridgeApi).forEach((key) => {
        ArkWindow.app[key] = luaBridgeApi[key];
      });
    }
    // 覆盖需要代理的函数
    ArkWindow.app.getExtendObject = ArkWindow.getExtendObject;

    return lua;
  }

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
     var appKey = '11355a7afcff0422faaaa06a84fb8c6e';


     return {
       appid: 'com.tencent.video.lua',
       appKey,
       images: [{"name":"res/image/bottom-cover.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.video.lua/res/image/bottom-cover.png"},{"name":"res/image/play-icon.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAMAAAC93eDPAAAAh1BMVEUAAAAAAAD///8xMTH///////////////////+7u7v///+fn5+AgID19fXq6ur///////9GRkZcXFzV1dWQkJDIyMgZGRn///////////////+bm5tSUlL09PSPj4+qqqouLi76+vrg4OD////////g4ODY2Nj////s7OzPz8+GhoZHR0f///+5diyoAAAALHRSTlNNAIBTcFB4QBBtCGdgfXowIFdbc2NwUDhgSBiEZOlkkFj0d2gox7xY2LF6VqZuuU4AAARySURBVHja7ZsJktMwEEU735K8r7GzMQyQBIZl7n8+xlBUV0UxsTYzQ+VdIC+/JS9yN63+OXeFu8JdwYNCdqhjuRNCYUScdjKum2xlgJPCYSsFrnJ62h5WGp4VskYqvFAe07zoomhDL2yitivy4YgRIc8rxrvC798v076lq7RFWgFQslkxHhWyWAFY5y39lbZfAxB14l0h2SugzCOaQdRXAGTiVSGRYwAdzaYb5kvQ3BKkLRkRpQDizI/CWQADV8BIQtQeFJIdl8BYouJq2CvUCuUjWVNUELWTQrYH1hExVtXYZ/YKieAIrOlLiMRWoVGoXCLgFSEaO4UtkG7IA5sB2NooxEBOnsiB2ECBDXgZBHWgaYOCPFJMO1B4A3YwUdiygU+H7XyFhleiR3qgmauQCDbwSQ6VzFPIBAYKQgqRzVLYo9pQEDYV9nMUapQRBSIqUd9WSAQeKRg9VHJTQSKlgKyxu6VQazdH76U4TyjwbigoKD1E9leFGBUFZo34bwoJEFFgussVSUutRWaA1BQWCYGJgERTWCQEJsVeU1gkBOYHVDahUGOgBeBNoSsIdLQIHdR1hQYVLUSJ5qqCxCMtRA55VUEhooWIoLIrCmesyYCPH949uCzIhhUs6/Dw/vn5/QcvlWAFgZbm8/V55IttEC2UrnAw2w/PIw5BlDhoClukpgouQaTYagpPKAwVnIJ4hNQUTmgNFZyCaCEuFTKADBXcgiiRXSg0OJoquAVxxOFCocZgquAWRIr6QiFGbqrgFkSO+EJBojBVcAuigLxQ2KEzVXALosOOFXhPmim4BRFBXCgIRE4KHIS1ArBxUuAg3tEsNlCaArkpMN9pFkA4hW93hRceLBWUr+X4afZyRKBN+fnjYtcFywiYFifHC7R9BHyBdrxN2UfAtylvN2uOwPFmXRueblhGwAzaI8vB8sGNIzDkiEZ7fC3JBMsIGPDjq937HNlHwHuSFaxOF+wiYAo8Ob/QcQTeXugOZouBI7Cj0l5rX1CmL/ccgd37nK4gjS5O3XuOwPKtVldozA56Ht59+Ohy0HO+opAte9w1ceiX0yJwHfSjz5IWokKjK4yo5Q6Axeq6Qow1LcKAekIhM7o0uH8TYQVmv9QnEfmaPwytJAYKCIcwrZAE3RQcgqaw7KaoEN/6YNxTUIqJD8bMGWXYz+YV6lvNA7uwpeC1OK2QqJCl6CGSt9BI8hraacZdkVIQhptNRbwcQrVWicSgwawPYYDmLbXZvYZmw9fQcsmtr37ogfgttt/+WpODnybk1LAJmWmEr1Zs1bg0pPeLN6TrbfmpW1v+2rItn6kFqsIpAlU7j2hIWK+Ibg3sXEY0OAi7akQDIM6+xnVgLtGmgIozv0NLQ2dSAq9DSyxR9fNGt/ISUHtvo1ssUQsA6/7WAFu+Bpcg0BhflRYTGm2flqHG+JizFBg5DnnRtX+GGaOuyNNjid+/rwUQYKTz6YSrCBl8pJPJmnGw9SQwooQYB1sPk//+fx3vvSvcFV74HxV+Aki4pHCvzfR7AAAAAElFTkSuQmCC"}],
       fonts: {"mainText":{"fontFamily":"Heiti SC,Heiti TC","size":17,"bold":false,"weight":400,"italic":false},"subText":{"fontFamily":"Heiti SC,Heiti TC","size":12,"bold":false,"weight":400,"italic":false},"fs-15":{"fontFamily":"Heiti SC,Heiti TC","size":15,"bold":false,"weight":400,"italic":false},"fs-14":{"fontFamily":"Heiti SC,Heiti TC","size":14,"bold":false,"weight":400,"italic":false},"fs-10":{"fontFamily":"Heiti SC,Heiti TC","size":10,"bold":false,"weight":400,"italic":false},"btnText":{"fontFamily":"Heiti SC,Heiti TC","size":17,"bold":false,"weight":500,"italic":false}},
       appVersion: "0.0.3.9",
       buildVersion: "20240221155813",
       styles: {"video":{"display":"flex","flexDirection":"column"},"video-wrapper":{"display":"flex","flexDirection":"column","width":"100%","height":"100%","position":"relative"},"video-bg-image":{"position":"absolute","top":"0","left":"0","width":"100%","height":"100%"},"video-top-tag":{"display":"block","width":"auto","height":"auto","position":"absolute","left":"9","top":"9"},"video-top-wrapper":{"display":"flex","alignItems":"center","width":"auto","height":"22","padding":"1 8 1 8"},"video-top-tag-icon":{"width":"16","height":"16","marginLeft":"2"},"video-top-tag-text":{"maxWidth":"130"},"video-bottom-wrapper":{"display":"flex","width":"100%","height":"100%","position":"absolute","bottom":"0"},"video-bottom-title-bar":{"display":"flex","justifyContent":"spaceBetween","alignItems":"center","width":"100%","height":"auto","position":"absolute","bottom":"0","padding":"4 8 8 8"},"video-bottom-cover":{"display":"flex","justifyContent":"spaceBetween","alignItems":"center","width":"100%","height":"40%","position":"absolute","bottom":"0"},"video-bottom-title-avatar":{"width":"16","height":"16","minWidth":"16","marginRight":"3"},"video-bottom-title-text":{"flex":"1"},"video-bottom-title-icon":{"width":"16","height":"16","minWidth":"16","marginLeft":"12"},"video-bottom-content-bar":{"display":"flex","alignItems":"center","width":"100%","height":"auto","position":"absolute","bottom":"28","padding":"0 9 0 8"},"video-play-icon":{"position":"absolute","top":"50%","left":"50%","width":"65","height":"65","marginLeft":"-32.5","marginTop":"-32.5"}},
       applicationEvents: [{"eventName":"OnCreateView","callback":"app.OnCreateView"},{"eventName":"OnExit","callback":"app.OnExit"},{"eventName":"OnStartup","callback":"app.OnStartup"},{"eventName":"OnConfigChange","callback":"app.OnConfigChange"},{"eventName":"OnActivate","callback":"app.OnActivate"}],
       applicationId: appKey + '_' + uniqueApplicationId,
       urlWhiteList: []
     };
   };

   /**
    * 释放资源
    * @description 使用_命名,防止被重写
    */
   ArkWindow._destroyResource_ = function () {
     ArkGlobalContext.clearTemplates();
   };

   /** 标识是Lua Ark */
   ArkWindow.isLua = true;

   async function createApp(options) {
     const lua = await luaRun();
     const templates = ArkGlobalContext.getViewTemplates();
     ArkWindow.lua = lua;
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
