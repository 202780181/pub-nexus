#!/usr/bin/env node

import fs from 'node:fs'
import { exec } from 'node:child_process'
import path from 'node:path'
import { red, green } from 'kolorist'

const cwd = process.cwd()

const defaultTargetDir = 'publish'

function fileExist(path) {
  return fs.existsSync(path)
}

function removeDir(dir) {
  let files = fs.readdirSync(dir)
  for (let i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath)
    if (stat.isDirectory()) {
      removeDir(newPath);
    } else {
      //删除文件
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir)
}

const isExist = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

/**
 * 复制文件夹到目标文件夹
 * @desc 兼容 node<= 16.7.0
 * @param {string} src 源目录
 * @param {string} dest 目标目录
 * @param {function} callback 回调
 */
function copyDirOld(src, dest, callback) {
  const copy = (copySrc, copyDest) => {
    fs.readdir(copySrc, (err, list) => {
      if (err) {
        callback(err)
        return;
      }
      list.forEach(item => {
        const ss = path.resolve(copySrc, item)
        fs.stat(ss, (err, stat) => {
          if (err) {
            callback(err)
          } else {
            const curSrc = path.resolve(copySrc, item)
            const curDest = path.resolve(copyDest, item)

            if (stat.isFile()) {
              fs.createReadStream(curDest).pipe(fs.createWriteStream(curDest))
            } else if (stat.isDirectory()) {
              fs.mkdirSync(curDest, {recursive: true})
              copy(curSrc, curDest)
            }
          }
        })
      })
    })
  }
  fs.access(dest, (err) => {
    if (err) {
      fs.mkdirSync(dest, {recursive: true})
    }
    copy(src, dest)
  })
}

const addPackageJSON = (projectName, version) => {
  return `{
  "name": "${projectName}",
  "version": "${version || '1.0.0'}",
  "files": [
    "dist"
  ],
  "devDependencies": {},
  "publishConfig" : {
    "registry" : "http://dev.fw135.com:8066/repository/npm-group"
  }
}
`
}

const npmRc = (email) => {
  return `
  registry=http://dev.fw135.com:8066/repository/npm-group/
  email=202780181@qq.com
  always-auth=true
  _auth="cmZ0QDAzMDM="
  `
}

function copyToDir(srcDir, destDir) {
  let deepPath = destDir + '/dist'
  let version = process.versions.node
  let pkg = JSON.parse(fs.readFileSync(cwd + '/package.json', 'utf8'))
  if (Number(version) <= Number('16.7.0')) {
    copyDirOld(srcDir, deepPath, (err) => {
      if (err) {
        console.log(red('✖ 文件复制失败,请重试'))
        process.exit(0)
      }
    })
  } else {
    // node >= 16.7.0
    fs.cp(srcDir, deepPath, {recursive: true}, (err) => {
      if (err) {
        console.log(red('✖ 文件复制失败,请重试'))
        process.exit(0)
      }
    })
  }
  fs.writeFile(destDir + '/package.json', addPackageJSON(pkg.name, pkg.version), 'utf-8', (err) => {
    if (err) {
      console.log(red('✖ package.json 创建失败，请重新执行 pub'))
      process.exit(0)
    }
  })
  fs.writeFile(destDir + '/.npmrc', npmRc(pkg.name, pkg.version), 'utf-8', (err) => {
    if (err) {
      console.log(red('✖ npmrc 创建失败，请重新执行 pub'))
      process.exit(0)
    }
  })
  console.log(green('✔️ 文件复制完成'))
}

function copy(src, target) {
  let dist = `${cwd}/dist`
  let copyPath = `${cwd}/${defaultTargetDir}`
  if (fileExist(dist)) {
    fs.mkdir(copyPath, function (error) {
      if (error) {
        console.log(red('✖ mkdir error, process exit'))
        process.exit(0)
      }
    })
    copyToDir(src, target)
  }
}

function push() {
  console.log('执行命令---->')
  exec('npm publish', function (err) {
    console.log(err)
  })
}

async function init() {

  let path = `${cwd}/${defaultTargetDir}`
  let pack = `${cwd}/package.json`
  let dist = `${cwd}/dist`

  if (!fileExist(pack)) {
    console.log(red('✖ 位置目录异常, pub-nexus 已终止'))
    process.exit(0)
  }
  if (!fileExist(dist)) {
    console.log(red('✖ 请先构建出dist生产文件后 再执行发布'))
    process.exit(0)
  }
  if (fileExist(path)) {
    removeDir(path)
  }
  copy(dist, path)
  push()
}

init().catch((e) => {
  console.error(e)
})


