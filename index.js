#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import spawn from 'cross-spawn'
import prompts from 'prompts'
import {
  blue,
  cyan,
  green,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from 'kolorist'

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
      //如果是文件夹就递归下去
      removeDir(newPath);
    } else {
      //删除文件
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir)
}

function copy(src, dest) {
  let path = `${cwd}`
  if(!fileExist(path)) {
    fs.mkdir(defaultTargetDir, function (error) {
      if(error) {
        throw new Error(red('✖') + 'mkdir error, process exit')
      }

    })
  }
}

async function init() {

  let path = `${cwd}/${defaultTargetDir}`
  let pack = `${cwd}/package.json`
  let dist = `${cwd}/dist`

  if(!fileExist(pack)) {
    throw new Error(red('✖') + '位置目录异常, 推送终止')
  }
  if(!fileExist(dist)) {
    throw new Error(red('✖') + '请先构建出dist生产文件后在执行发布')
  }
  if (fileExist(path)) {
    removeDir(path)
  }
  copy()
}

init().catch((e) => {
  console.error(e)
})


