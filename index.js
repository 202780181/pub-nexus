#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import spawn from 'cross-spawn'
import prompts from 'prompts'

const cwd = process.cwd()

const runSingleExec = async (name) => {
  var mes = null
  var err = null
  if (!name || name === '') return;

  function setValue(key, value) {
    console.log('key:')
    console.log(key)
    console.log('value:')
    mes = value
  }

  function mkdir(dirPath, dirName) {
    if(dirName !== path.dirname(dirPath)) {
      mkdir(dirPath)
      return;
    }
    if(fs.existsSync(dirName)) {
      fs.mkdirSync(dirPath)
    }else {
      mkdir(dirName, path.dirname(dirName))
      fs.mkdirSync(dirPath)
    }
  }

  // const response = await prompts({
  //   type: 'number',
  //   name: 'value',
  //   message: 'How old are you?',
  //   validate: value => value < 18 ? `Nightclub is 18+ only` : true
  // });
  // console.log(response);

  const { status } = spawn.sync('npm install', [], {
    stdio: 'inherit',
  })
  process.exit(status ?? 0)

  return {mes, err};
}

let acount = runSingleExec('git config user.name')

console.log(acount)
