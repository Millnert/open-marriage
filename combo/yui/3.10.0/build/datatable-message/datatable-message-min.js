/*
YUI 3.10.0 (build a03ce0e)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datatable-message",function(e,t){var n;e.namespace("DataTable").Message=n=function(){},n.ATTRS={showMessages:{value:!0,validator:e.Lang.isBoolean}},e.mix(n.prototype,{MESSAGE_TEMPLATE:'<tbody class="{className}"><tr><td class="{contentClass}" colspan="{colspan}"></td></tr></tbody>',hideMessage:function(){return this.get("boundingBox").removeClass(this.getClassName("message","visible")),this},showMessage:function(e){var t=this.getString(e)||e;return this._messageNode||this._initMessageNode(),this.get("showMessages")&&(t?(this._messageNode.one("."+this.getClassName("message","content")).setHTML(t),this.get("boundingBox").addClass(this.getClassName("message","visible"))):this.hideMessage()),this},_afterMessageColumnsChange:function(){var e;this._messageNode&&(e=this._messageNode.one("."+this.getClassName("message","content")),e&&e.set("colSpan",this._displayColumns.length))},_afterMessageDataChange:function(){this._uiSetMessage()},_afterShowMessagesChange:function(e){e.newVal?this._uiSetMessage(e):this._messageNode&&(this.get("boundingBox").removeClass(this.getClassName("message","visible")),this._messageNode.remove().destroy(!0),this._messageNode=null)},_bindMessageUI:function(){this.after(["dataChange","*:add","*:remove","*:reset"],e.bind("_afterMessageDataChange",this)),this.after("columnsChange",e.bind("_afterMessageColumnsChange",this)),this.after("showMessagesChange",e.bind("_afterShowMessagesChange",this))},initializer:function(){this._initMessageStrings(),this.get("showMessages")&&this.after("table:renderBody",e.bind("_initMessageNode",this)),this.after(e.bind("_bindMessageUI",this),this,"bindUI"),this.after(e.bind("_syncMessageUI",this),this,"syncUI")},_initMessageNode:function(){this._messageNode||(this._messageNode=e.Node.create(e.Lang.sub(this.MESSAGE_TEMPLATE,{className:this.getClassName("message"),contentClass:this.getClassName("message","content"),colspan:this._displayColumns.length||1})),this._tableNode.insertBefore(this._messageNode,this._tbodyNode))},_initMessageStrings:function(){this.set("strings",e.mix(this.get("strings")||{},e.Intl.get("datatable-message")))},_syncMessageUI:function(){this._uiSetMessage()},_uiSetMessage:function(e){this.data.size()?this.hideMessage():this.showMessage(e&&e.message||"emptyMessage")}}),e.Lang.isFunction(e.DataTable)&&e.Base.mix(e.DataTable,[n])},"3.10.0",{requires:["datatable-base"],lang:["en","fr","es","it"],skinnable:!0});
