#!/usr/bin/env node

const fs = require('fs');
let argv = require('yargs');

argv = argv.usage('Usage: $0 <command> [options]');

const files = fs.readdirSync('./commands');

files.forEach((commandName) => {
    const commandPath = `./commands/${commandName}`;
    argv = argv.command(require(commandPath));
});

argv = argv.option('user', {
    'alias': 'u',
    'type': 'string',
    'describe': 'The user which should execute this command.',
    'default': 'user-1'
});

argv.help('h').alias('h', 'help').argv; // eslint-disable-line
