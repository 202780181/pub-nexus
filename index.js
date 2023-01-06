#!/usr/bin/env node

import { exec } from 'node:child_process'

const runSingleExec = (name) => {
  var mes = null
  var err = null
  if (!name || name === '') return;

  exec(name, function (error, stdout, stderr) {
    console.log('当前git:'+stdout)
    mes = stdout.toString()
  })
  console.log('当前返回信息:'+ mes)
}

const gitName = runSingleExec('git config user.name')
console.log(gitName)
