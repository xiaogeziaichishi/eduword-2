# 概述
**仓库名称：eduword，因此[vite.config.ts](vite.config.ts)加上了base的判断条件**
1. 不使用自定义域名，使用github.io，要加上eduword后缀，因为要查询你的项目名称的目录，所以base加上eduword。
2. 使用自定义域名（cf）,base置空即可。


## Run 本地

**必需:**  Node.js

1. 依赖
   `npm install --registry=https://registry.npmmirror.com`
 
2. 本地运行
   `npm run dev`


## Run 远程（github pages）

1. 执行 `npm run build:custom` 是使用域名访问 或者`npm run build` 不需要使用域名，打包生成docs的文件夹。
2. 上传github远程。
3. 使用域名访问：https://eduword-2.bingxiangtie.top/
## 按路径读取不同 CSV

现在支持按 URL 路径自动读取对应 CSV：

1. `https://你的域名/1` 会读取 `1.csv`
2. `https://你的域名/2` 会读取 `2.csv`
3. 无路径时读取默认 `word_translations.csv`
4. 也支持 query：`https://你的域名/?csv=5` 会读取 `5.csv`

注意：

1. 你现在可以继续把 CSV 放在 `docs/`（例如 `docs/1.csv`、`docs/2.csv`）
2. 已在 `vite.config.ts` 配置 `emptyOutDir: false`，打包时不会清空 `docs/` 里的 CSV
