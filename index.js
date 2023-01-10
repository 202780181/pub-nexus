#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { red, green } from 'kolorist'

const cwd = process.cwd()

const defaultTargetDir = 'publish'

function fileExist(path) {
  return fs.existsSync(path)
}

const packagePlate = `
{
  "name": "unit",
  "version": "1.0.0",
  "files": [
    "dist"
  ],
  "devDependencies": {}
}
`

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

function copyToDir(srcDir, destDir) {
  // node >= 16.7.0
  fs.cp(srcDir, destDir, {recursive: true}, (err) => {
    if (err) {
      console.log(red('✖ 文件复制失败,请重试'))
      process.exit(0)
    }
  });
  console.log(green('✔️文件复制完成'))
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
      copyToDir(src, target)
    })
  }
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
}

init().catch((e) => {
  console.error(e)
})


