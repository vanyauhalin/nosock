#!/bin/bash

branch="$(git rev-parse --abbrev-ref HEAD)"
enum="feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"
regexp="^($enum)\/[a-z0-9._-]+$"
if [[ ! $branch =~ $regexp ]]; then
	echo "There is something wrong with your branch name. Branch names in this project must adhere to this contract: $regexp. Your commit will be rejected. You should rename your branch to a valid name and try again."
	exit 1
fi
exit 0
