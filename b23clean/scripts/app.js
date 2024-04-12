const { Toast } = require("./libs/toast")

function getUrls() {
    const input = (() => {
        const inputList = [$actions.inputValue, $clipboard.text]
        for (let i = 0; i < inputList.length; i++) {
            if (inputList[i] && inputList[i] !== "") {
                return inputList[i]
            }
        }
        return ""
    })()

    const regex = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([:0-9])*([\/\w\#\.\-\?\=\&])*\s?/gi
    return input.match(regex) ?? []
}

async function cleanUrl(b23url) {
    if (b23url.indexOf("bilibili.com") === -1 && b23url.indexOf("b23.tv") === -1) {
        throw new Error($l10n("b23clean.noBiliUrl"))
    }

    let url = b23url
    if (b23url.indexOf("b23.tv") >= 0) {
        const resp = await $http.get(b23url)
        url = resp.response.url
    }

    const queryStart = url.indexOf("?")
    if (queryStart > -1) {
        url = url.substring(0, queryStart - 1)
    }

    return url
}

async function main() {
    const loading = Toast.info($l10n("b23clean.converting"), { show: false })

    try {
        const b23url = getUrls()
        if (b23url.length === 0) {
            throw new Error($l10n("b23clean.noUrl"))
        }

        let url = b23url[0]
        if (b23url.length > 1) {
            const urlSelected = await $ui.menu({
                items: b23url
            })
            url = b23url[urlSelected.index]
        }

        if (url.indexOf("bilibili.com") === -1 && url.indexOf("b23.tv") === -1) {
            throw new Error($l10n("b23clean.noBiliUrl"))
        }

        loading.show()
        url = await cleanUrl(url)
        loading.remove()

        await $ui.alert({
            title: $l10n("b23clean.success"),
            message: url,
            actions: [
                { title: $l10n("OK") },
                {
                    title: $l10n("COPY"),
                    handler: () => {
                        $clipboard.text = url
                        Toast.success($l10n("COPIED"))
                    }
                }
            ]
        })
    } catch (error) {
        loading.remove()
        $delay(0.5, () => Toast.error(String(error)))
    }
}

module.exports = {
    run: () => {
        main().catch(error => console.error(error))
    }
}
