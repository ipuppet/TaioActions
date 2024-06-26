const { UIKit, Kernel, Logger } = require("./lib/easy-jsbox")
const juice = require("./lib/juice.min.js")

class AppKernel extends Kernel {
    constructor() {
        super()
        this.logger = new Logger()
        this.juice = juice
    }
}

class AppUI {
    static renderMainUI() {
        const kernel = new AppKernel()
        kernel.useJsboxNav()
        const MainUI = require("./ui/main")
        const mainUI = new MainUI(kernel)
        kernel.setNavButtons(mainUI.getNavButtons())
        kernel.UIRender(mainUI.getView())
    }

    static renderUnsupported() {
        $intents.finish("不支持在此环境中运行")
        $ui.render({
            views: [
                {
                    type: "label",
                    props: {
                        text: "不支持在此环境中运行",
                        align: $align.center
                    },
                    layout: $layout.fill
                }
            ]
        })
    }

    static handleTaio() {
        try {
            const text = $actions.inputValue
            const result = juice(text)
            $actions.resolve(result)
        } catch (error) {
            $actions.reject(error)
        }
    }
}

module.exports = {
    run: () => {
        if (UIKit.isTaio) {
            AppUI.handleTaio()
        } else if ($app.env === $env.app) {
            AppUI.renderMainUI()
        } else {
            AppUI.renderUnsupported()
        }
    }
}
