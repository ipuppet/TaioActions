class MainUI {
    margin = 20
    bgcolor = $color("insetGroupedBackground")

    constructor(kernel) {
        this.kernel = kernel
        this.contentTextId = "content-text"
        this.resultTextId = "result-text"
    }

    getNavButtons() {
        return [
            {
                symbol: "play.circle.fill",
                title: $l10n("START"),
                handler: () => {
                    const text = $(this.contentTextId).text
                    if (!text || text === "") {
                        $ui.warning("Content is empty")
                        return
                    }
                    try {
                        const result = this.kernel.juice(text)
                        $(this.resultTextId).text = result
                        $ui.success("Done")
                    } catch (error) {
                        this.kernel.logger.error(error)
                    }
                }
            },
            {
                symbol: "doc.on.clipboard",
                title: $l10n("PASTE"),
                handler: () => {
                    const text = $clipboard.text
                    if (text && text !== "") {
                        $(this.contentTextId).text = text
                    } else {
                        $ui.warning("Clipboard is empty")
                    }
                }
            }
        ]
    }

    getView() {
        return {
            type: "view",
            props: {},
            layout: $layout.fill,
            views: [
                {
                    type: "text",
                    props: {
                        id: this.contentTextId,
                        cornerRadius: 10,
                        smoothCorners: true,
                        placeholder: "Content here",
                        bgcolor: this.bgcolor
                    },
                    layout: (make, view) => {
                        make.top.left.right.equalTo(view.super.safeArea).inset(this.margin)
                        make.height
                            .equalTo(view.super.safeArea)
                            .dividedBy(2)
                            .offset(this.margin * 2 * -1)
                    }
                },
                {
                    type: "text",
                    props: {
                        id: this.resultTextId,
                        cornerRadius: 10,
                        smoothCorners: true,
                        editable: false,
                        placeholder: "Result here",
                        menu: {
                            items: [
                                {
                                    symbol: "doc.on.clipboard",
                                    title: $l10n("COPY"),
                                    handler: () => {
                                        const text = $(this.resultTextId).text
                                        if (text && text !== "") {
                                            $clipboard.text = $(this.resultTextId).text
                                            $ui.success("Copied")
                                        } else {
                                            $ui.warning("Result is empty")
                                        }
                                    }
                                }
                            ]
                        },
                        bgcolor: this.bgcolor
                    },
                    layout: (make, view) => {
                        make.bottom.left.right.equalTo(view.super.safeArea).inset(this.margin)
                        make.top.equalTo(view.prev.bottom).offset(this.margin)
                    }
                }
            ]
        }
    }
}

module.exports = MainUI
