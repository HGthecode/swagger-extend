
var swaggerExtend={
    data:{
        currentCodeStr:"",
        currentControllerName:"",
        currentControllerUrlList:[],
        showDesc:true,

    },
    init(){
        this.loadResource();
        this.onPageLoad()
    },
    onPageLoad(){
        setTimeout(() => {
            const controllerList = document.querySelectorAll('.opblock-tag-section h3.opblock-tag');
            if (controllerList && controllerList.length) {
                this.appendControllerButton(controllerList);
            }else{
                this.onPageLoad();
            }
        }, 2000);
    },
    loadResource(){
        this.loadStyles("https://cdn.jsdelivr.net/gh/HGthecode/swagger-extend/swagger-extend.css");
        this.loadStyles("https://cdn.jsdelivr.net/npm/highlight.js@11.6.0/styles/atom-one-dark.css");
        setTimeout(() => {
            this.loadScript("//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js");
        }, 1000);
    },
    loadStyles(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    },
    loadScript(url) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        document.body.appendChild(script);
    },
    appendControllerButton(controllerList){
        const that=this
        for (let i = 0; i < controllerList.length; i++) {
            const item = controllerList[i];
            item.addEventListener('click', function (e) {
                that.onControllerTagClick(item)
            })
        }
    },
    onControllerTagClick(item){
        if (item.dataset) {
            var isOpen = item.dataset.isOpen=='true'
            const controllerName = item.querySelector('a.nostyle span').innerHTML;
            if (!isOpen) {
                const lastButton =item.querySelector('.expand-operation');
                const addButtonDom = this.getControllerTagButton(item,controllerName)
                item.insertBefore(addButtonDom,lastButton)
            }else{
                var controllerButon = item.querySelector('.controller-button')
                if (controllerButon) {
                    controllerButon.remove();
                } 
            }
        }
    },
    getControllerTagButton(item,controllerName){
        const that=this;
        var button =document.createElement('button');
        button.className="controller-button"
        button.innerText="⚡"
        button.addEventListener('click', function (e) {
            e.stopPropagation()
            that.onControllerButtonClick(item,controllerName)
        })
        return button
    },
    onControllerButtonClick(item,controllerName){
        const parentDom = item.parentNode;
        const apiList = parentDom.querySelectorAll('.no-margin .operation-tag-content > span')
        if (apiList && apiList.length) {
            var urlList = [];
            for (let i = 0; i < apiList.length; i++) {
                const apiItem = apiList[i];
                const pathDom = apiItem.querySelector('.opblock-summary-path');
                const methodDom = apiItem.querySelector('.opblock-summary-method'); 
                const descDom = apiItem.querySelector('.opblock-summary-description');
                if (pathDom && pathDom.dataset) {
                    const url = pathDom.dataset.path
                    urlList.push({
                        method:methodDom.innerHTML || "",
                        url:url,
                        desc:descDom.innerHTML || ""
                    })
                }
            }
            this.data.currentControllerName = controllerName;
            this.data.currentControllerUrlList = urlList;
            const codeStr = this.renderApiCodes(controllerName,urlList)
            this.showCodeModal(codeStr,`${controllerName}Api 代码`)
        }
    },
    
    renderApiCodes(controllerName,urlList){
        controllerName = controllerName.replace(controllerName[0],controllerName[0].toLowerCase());
        var urlStr = ``;
        var funStr = ``;
        
        for (let i = 0; i < urlList.length; i++) {
            const item = urlList[i];
            const url = item.url;
            var urlArr = url.split('/')
            let methodName = urlArr[urlArr.length-1];
            urlStr+=`    ${methodName}: "${url}",`;
            var funStrDesc = ""
            if (this.data.showDesc) {
                urlStr+=`// ${item.desc}`+"\n";
                funStrDesc=`// ${item.desc}`+"\n"+"    ";
            }else{
                urlStr+="\n";
            }
            
            funStr+=`
    ${funStrDesc}static ${methodName}(data) {
        return sendRequest(url.${methodName}, data, "${item.method.toLowerCase()}");
    }
        `;
    }
    var codeStr = `
import sendRequest from "@/utils/request";

export const url = {
${urlStr}
};

export default class ${controllerName}Api {
${funStr}
}
    `;
        return codeStr
    },
    showCodeModal(codeStr,title="代码"){
        this.data.currentCodeStr = codeStr;
        var hljsCode = hljs.highlight(codeStr, {language:"javascript"});
        var codeDom = ""
        if (hljsCode) {
            codeDom = hljsCode.value;
        }
        var showDescChecked = this.data.showDesc?`checked="checked"`:''
        var modalHtml = `
        <div class="code-modal-wraper">
            <div class="code-modal-header">
                <div class="modal-title">${title}</div>
                <div class="modal-actions">
                    <a href="javascript:swaggerExtend.onCloseModal();">×</a>
                </div>
            </div>
            <div class="code-modal-content">
                <div class="code-wraper">
                    <pre>
                    <code id="codeContent" class="hljs language-javascript">
                        ${codeDom}
                    </code>
                </pre>
                </div>
            </div>
            <div class="code-modal-footer">
                <div class="left">
                    <label><input name="showDesc" type="checkbox" ${showDescChecked} onchange="swaggerExtend.onShowDescChange(this)"/>显示注释 </label>
                </div>
                <div class="buttons">
                <button class="code-button" onclick="swaggerExtend.onCopy()">复制</button>
                <button class="code-button" onclick="swaggerExtend.onCloseModal();">关闭</button>
                </div>
            </div>
        </div>
        <div class="code-modal-bg"></div>
        `
        let divObj = document.createElement('div');
        divObj.id = 'codeModal';
        divObj.className = 'code-modal';
        divObj.innerHTML = modalHtml;
        document.body.appendChild(divObj);
       
    },
    onCopy(){
        var is = this.copyTextToClipboard(this.data.currentCodeStr)
        if (is) {
            this.showTips('复制成功')
        }
    },
    showTips(text,status='success',time=2000){
        let divObj = document.createElement('div');
        divObj.id = 'codeTips';
        divObj.className = 'code-tips';
        divObj.innerHTML = `<span class="${status}">${text}</span>`;
        document.body.appendChild(divObj);
        setTimeout(() => {
            document.querySelector('#codeTips').remove()
        }, time);
    },
    onCloseModal(){
        var dom = document.querySelector('#codeModal')
        dom.remove()
    },
    copyTextToClipboard(text) {
        const element = document.createElement('textarea')
        element.value = text
        element.setAttribute('readonly', '')
        element.style.position = 'absolute'
        element.style.left = '-9999px'
        element.style.fontSize = '12pt'
        const selection = document.getSelection()
        let originalRange
        if (selection && selection.rangeCount > 0) {
          originalRange = selection.getRangeAt(0)
        }
        document.body.append(element)
        element.select()
        element.selectionStart = 0
        element.selectionEnd = text.length
        let isSuccess = false
        try {
          document.execCommand('copy')
          isSuccess = true
        } catch (e) {
          throw new Error()
        }
        element.remove()
        if (originalRange && selection) {
          selection.removeAllRanges()
          selection.addRange(originalRange)
        }
        return isSuccess
    },
    onShowDescChange(e){
        this.data.showDesc = e.checked;
        const codeStr = this.renderApiCodes(this.data.currentControllerName,this.data.currentControllerUrlList)
        this.data.currentCodeStr = codeStr;
        var hljsCode = hljs.highlight(codeStr, {language:"javascript"});
        var codeDom = ""
        if (hljsCode) {
            codeDom = hljsCode.value;
        }
        document.querySelector('#codeContent').innerHTML = codeDom
    }
}
swaggerExtend.init()
window.swaggerExtend = swaggerExtend

