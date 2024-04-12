const fs = require("fs")
const path = require("path")
const process = require("child_process")

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"))

const outputName = config.info.name
const distEntryPath = path.join(__dirname, `dist/${outputName}.js`)
const entryFile = "main.js"
const entryFilePath = path.join(__dirname, entryFile)
const entryFileContent = fs.readFileSync(entryFilePath, "utf-8")

function injectContent() {
    const stringsFolder = path.join(__dirname, "strings")
    const stringsFiles = fs.readdirSync(stringsFolder)
    const localizedText = {}

    stringsFiles.forEach(fileName => {
        if (path.extname(fileName) !== ".strings") {
            return
        }

        const locale = fileName.replace(".strings", "")
        localizedText[locale] = {}

        const filePath = path.join(stringsFolder, fileName)
        const content = fs.readFileSync(filePath, "utf-8")
        const lines = content.split(/\r?\n/)
        lines.forEach(line => {
            const match = /[\"'](.+)[\"'][ \n]*=[ \n]*[\"'](.+)[\"']/.exec(line)
            if (match) {
                localizedText[locale][match[1]] = match[2]
            }
        })
    })

    const stringsText = `$app.strings = ${JSON.stringify(localizedText)};`

    const configSettings = Object.keys(config.settings)
        .map(key => {
            const value = (() => {
                const value = config.settings[key]
                if (typeof value === "string") {
                    return `"${value}"`
                } else {
                    return value
                }
            })()
            return `$app.${key} = ${value};`
        })
        .join("\n")

    const contents = [stringsText, configSettings, entryFileContent]

    fs.writeFileSync(entryFilePath, contents.join("\n\n"))
}

function buildTextActions() {
    const script = fs.readFileSync(distEntryPath, "utf-8")
    const template = path.join(__dirname, "template.json")
    const fileContent = fs.readFileSync(template, "utf-8")
    const textAction = JSON.parse(fileContent)

    textAction.name = config.info.name

    for (let i = 0; i < textAction.actions.length; i++) {
        if (textAction.actions[i].type === "@flow.javascript") {
            textAction.actions[i].parameters.script.value = script
            break
        }
    }
    const outputPath = path.join(__dirname, `dist/${outputName}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(textAction, null, 4))
}

function injectPackageJson(packageJson) {
    packageJson.jsbox = distEntryPath
    packageJson.targets = {
        jsbox: {
            source: entryFile,
            includeNodeModules: false,
            sourceMap: false,
            outputFormat: "global"
        }
    }

    return packageJson
}

async function build() {
    const packageJsonPath = path.join(__dirname, "package.json")
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8")

    const packageJson = injectPackageJson(JSON.parse(packageJsonContent))
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson))

    try {
        injectContent()
        const stdout = process.execSync(`parcel build`)
        console.log(stdout.toString())
        buildTextActions()
    } catch (error) {
        if (error.stdout) {
            console.log(error.stdout.toString())
        } else {
            console.log(error)
        }
    } finally {
        // 恢复文件内容
        fs.writeFileSync(entryFilePath, entryFileContent)
        fs.writeFileSync(packageJsonPath, packageJsonContent)
    }
}

build()
