#!/usr/bin/env node
import * as todoist from "./prompts/todoist.OpsPrompts.js"
import { todoistkey } from "./prompts/todoist.GetKey.js"

const registerFlag = process.argv.includes('--register');
const showFlag = process.argv.includes('--show');
const createFlag = process.argv.includes('--create');
const updateFlag = process.argv.includes('--update');
const completeFlag = process.argv.includes('--complete');
const deleteFlag = process.argv.includes('--delete');

if (registerFlag) {
    await todoistkey()
}

if (showFlag) {
    await todoist.GetTasks()
}

if (createFlag) {
    await todoist.CreateTask()
}

if (updateFlag) {
    await todoist.UpdateTask()
}

if (completeFlag) {
    await todoist.Completion()
}

if (deleteFlag) {
    await todoist.DeleteTask()
}