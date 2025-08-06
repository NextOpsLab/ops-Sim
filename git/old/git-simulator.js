// Comprehensive Git Simulator - Core State and Basic Functions
// Based on official Git documentation

// Global Git State
let gitState = {
    // Repository info
    repositoryName: 'my-project',
    isInitialized: true,
    currentBranch: 'main',
    
    // Branches with their commit history
    branches: {
        main: {
            commits: [
                {
                    hash: 'a1b2c3d',
                    message: 'Initial commit',
                    author: 'User <user@example.com>',
                    timestamp: new Date().toISOString(),
                    files: ['README.md', '.gitignore'],
                    parent: null
                }
            ],
            head: 'a1b2c3d'
        }
    },
    
    // Working directory states
    workingDirectory: ['README.md', '.gitignore', 'index.html', 'style.css'],
    untrackedFiles: ['index.html', 'style.css'],
    modifiedFiles: [],
    stagedFiles: [],
    deletedFiles: [],
    
    // Remote repositories
    remotes: {
        origin: {
            url: 'https://github.com/user/my-project.git',
            branches: {
                main: 'a1b2c3d',
                develop: null
            }
        }
    },
    
    // Tags
    tags: {},
    
    // Stash
    stash: [],
    
    // Configuration
    config: {
        'user.name': 'Git User',
        'user.email': 'user@example.com',
        'core.editor': 'nano',
        'init.defaultBranch': 'main'
    },
    
    // Aliases
    aliases: {
        'st': 'status',
        'co': 'checkout',
        'br': 'branch',
        'ci': 'commit'
    }
};

// Utility Functions
function generateHash() {
    return Math.random().toString(36).substr(2, 7);
}

function getCurrentBranch() {
    return gitState.branches[gitState.currentBranch];
}

function updateDisplay() {
    updateTerminalPrompt();
    updateFileAreas();
    updateBranchGraph();
    updateRemoteDisplay();
    updateTagsDisplay();
    updateStashDisplay();
}

function updateTerminalPrompt() {
    document.getElementById('current-branch').textContent = gitState.currentBranch;
}

// Terminal Functions
function addToTerminal(command, output, type = 'output') {
    const terminal = document.getElementById('terminal');
    
    // Add command prompt
    const promptDiv = document.createElement('div');
    promptDiv.className = 'prompt';
    promptDiv.textContent = `$ ${command}`;
    terminal.appendChild(promptDiv);
    
    // Add output
    const outputDiv = document.createElement('div');
    outputDiv.className = type;
    outputDiv.innerHTML = output;
    terminal.appendChild(outputDiv);
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
    
    // Update displays
    updateDisplay();
}

function clearTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.innerHTML = '<div class="prompt">$ git status</div><div class="output">On branch main<br>nothing to commit, working tree clean</div>';
}

function handleCommand(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim();
        if (command) {
            executeCommand(command);
            input.value = '';
        }
    }
}

function executeCommand(command) {
    const parts = command.split(' ');
    const gitCmd = parts[0];
    const subCmd = parts[1];
    const args = parts.slice(2);
    
    if (gitCmd !== 'git') {
        addToTerminal(command, `bash: ${gitCmd}: command not found`, 'error');
        return;
    }
    
    // Handle git aliases
    const actualCmd = gitState.aliases[subCmd] || subCmd;
    
    switch (actualCmd) {
        case 'init':
            gitInit();
            break;
        case 'status':
            gitStatus();
            break;
        case 'add':
            if (args[0] === '.') gitAdd();
            else if (args[0]) gitAddFile(args[0]);
            else addToTerminal(command, 'Nothing specified, nothing added.', 'error');
            break;
        case 'commit':
            if (args[0] === '-m' && args[1]) gitCommitMessage(args.slice(1).join(' '));
            else if (args[0] === '--amend') gitAmend();
            else gitCommit();
            break;
        case 'log':
            if (args.includes('--oneline')) gitLogOneline();
            else if (args.includes('--graph')) gitLogGraph();
            else gitLog();
            break;
        case 'branch':
            if (args[0] === '-d' && args[1]) gitBranchDelete(args[1]);
            else if (args[0]) gitBranchCreate(args[0]);
            else gitBranch();
            break;
        case 'checkout':
            if (args[0] === '-b' && args[1]) gitCheckoutNew(args[1]);
            else if (args[0] === '--' && args[1]) gitCheckoutFile(args[1]);
            else if (args[0]) gitCheckout(args[0]);
            else addToTerminal(command, 'You must specify a branch or file', 'error');
            break;
        case 'merge':
            if (args[0]) gitMerge(args[0]);
            else addToTerminal(command, 'You must specify a branch to merge', 'error');
            break;
        case 'push':
            if (args[0] === '-u' || args.includes('--set-upstream')) gitPushUpstream();
            else if (args.includes('--tags')) gitPushTags();
            else gitPush();
            break;
        case 'pull':
            gitPull();
            break;
        case 'fetch':
            gitFetch();
            break;
        case 'remote':
            if (args[0] === 'add' && args[1] && args[2]) gitRemoteAdd(args[1], args[2]);
            else gitRemote();
            break;
        case 'tag':
            if (args[0] === '-a' && args[1]) gitTagAnnotated(args[1], args.slice(2).join(' '));
            else if (args[0]) gitTag(args[0]);
            else gitTag();
            break;
        case 'stash':
            if (args[0] === 'pop') gitStashPop();
            else gitStash();
            break;
        case 'reset':
            if (args.includes('--hard')) gitResetHard();
            else gitReset();
            break;
        case 'revert':
            if (args[0]) gitRevert(args[0]);
            else addToTerminal(command, 'You must specify a commit to revert', 'error');
            break;
        case 'rebase':
            if (args[0] === '-i') gitRebaseInteractive();
            else if (args[0]) gitRebase(args[0]);
            else addToTerminal(command, 'You must specify a branch to rebase onto', 'error');
            break;
        case 'cherry-pick':
            if (args[0]) gitCherryPick(args[0]);
            else addToTerminal(command, 'You must specify a commit to cherry-pick', 'error');
            break;
        case 'diff':
            if (args.includes('--staged') || args.includes('--cached')) gitDiffStaged();
            else gitDiff();
            break;
        case 'show':
            if (args[0]) gitShow(args[0]);
            else gitShow();
            break;
        case 'config':
            if (args[0] && args[1]) gitConfig(args[0], args[1]);
            else gitConfig();
            break;
        case 'clone':
            if (args[0]) gitClone(args[0]);
            else addToTerminal(command, 'You must specify a repository to clone', 'error');
            break;
        default:
            addToTerminal(command, `git: '${subCmd}' is not a git command. See 'git --help'.`, 'error');
    }
}

// Basic Git Commands Implementation

// Repository Setup Commands
function gitInit() {
    if (gitState.isInitialized) {
        addToTerminal('git init', 'Reinitialized existing Git repository in /path/to/repo/.git/', 'output');
    } else {
        gitState.isInitialized = true;
        addToTerminal('git init', 'Initialized empty Git repository in /path/to/repo/.git/', 'success');
    }
}

function gitClone(url) {
    if (!url) url = 'https://github.com/user/example-repo.git';
    const repoName = url.split('/').pop().replace('.git', '');
    gitState.repositoryName = repoName;
    
    // Simulate cloning
    gitState.workingDirectory = ['README.md', 'package.json', 'src/index.js'];
    gitState.untrackedFiles = [];
    gitState.modifiedFiles = [];
    gitState.stagedFiles = [];
    
    const output = `Cloning into '${repoName}'...\nremote: Enumerating objects: 15, done.\nremote: Total 15 (delta 0), reused 0 (delta 0)\nReceiving objects: 100% (15/15), done.`;
    addToTerminal(`git clone ${url}`, output, 'success');
}

function gitConfig(key, value) {
    if (!key && !value) {
        let output = 'Git Configuration:\n';
        Object.entries(gitState.config).forEach(([k, v]) => {
            output += `${k}=${v}\n`;
        });
        addToTerminal('git config --list', output, 'output');
    } else if (key && value) {
        gitState.config[key] = value;
        addToTerminal(`git config ${key} "${value}"`, `Set ${key} to ${value}`, 'success');
    } else if (key) {
        const value = gitState.config[key];
        if (value) {
            addToTerminal(`git config ${key}`, value, 'output');
        } else {
            addToTerminal(`git config ${key}`, `No such configuration: ${key}`, 'error');
        }
    }
}

// Recording Changes Commands
function gitStatus() {
    let output = `On branch ${gitState.currentBranch}\n`;
    
    // Check if branch is ahead/behind remote
    const remoteBranch = gitState.remotes.origin?.branches[gitState.currentBranch];
    const currentHead = getCurrentBranch().head;
    if (remoteBranch && remoteBranch !== currentHead) {
        output += `Your branch is ahead of 'origin/${gitState.currentBranch}' by 1 commit.\n  (use "git push" to publish your local commits)\n\n`;
    }
    
    if (gitState.stagedFiles.length > 0) {
        output += 'Changes to be committed:\n  (use "git reset HEAD <file>..." to unstage)\n';
        gitState.stagedFiles.forEach(file => {
            output += `\t<span class="success">new file:   ${file}</span>\n`;
        });
        output += '\n';
    }
    
    if (gitState.modifiedFiles.length > 0) {
        output += 'Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git checkout -- <file>..." to discard changes in working directory)\n';
        gitState.modifiedFiles.forEach(file => {
            output += `\t<span class="warning">modified:   ${file}</span>\n`;
        });
        output += '\n';
    }
    
    if (gitState.deletedFiles.length > 0) {
        output += 'Changes not staged for commit:\n';
        gitState.deletedFiles.forEach(file => {
            output += `\t<span class="error">deleted:    ${file}</span>\n`;
        });
        output += '\n';
    }
    
    if (gitState.untrackedFiles.length > 0) {
        output += 'Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
        gitState.untrackedFiles.forEach(file => {
            output += `\t<span class="error">${file}</span>\n`;
        });
        output += '\n';
    }
    
    if (gitState.stagedFiles.length === 0 && gitState.modifiedFiles.length === 0 && 
        gitState.untrackedFiles.length === 0 && gitState.deletedFiles.length === 0) {
        output += 'nothing to commit, working tree clean';
    }
    
    addToTerminal('git status', output);
}

function gitAdd() {
    if (gitState.modifiedFiles.length === 0 && gitState.untrackedFiles.length === 0 && gitState.deletedFiles.length === 0) {
        addToTerminal('git add .', 'No changes to add', 'output');
        return;
    }
    
    // Move all modified and untracked files to staged
    gitState.stagedFiles = [...new Set([...gitState.stagedFiles, ...gitState.modifiedFiles, ...gitState.untrackedFiles])];
    gitState.modifiedFiles = [];
    gitState.untrackedFiles = [];
    
    addToTerminal('git add .', 'Changes staged for commit', 'success');
}

function gitAddFile(filename) {
    if (!filename) {
        addToTerminal('git add', 'Nothing specified, nothing added.', 'error');
        return;
    }
    
    if (gitState.modifiedFiles.includes(filename)) {
        gitState.stagedFiles.push(filename);
        gitState.modifiedFiles = gitState.modifiedFiles.filter(f => f !== filename);
        addToTerminal(`git add ${filename}`, `Added ${filename} to staging area`, 'success');
    } else if (gitState.untrackedFiles.includes(filename)) {
        gitState.stagedFiles.push(filename);
        gitState.untrackedFiles = gitState.untrackedFiles.filter(f => f !== filename);
        addToTerminal(`git add ${filename}`, `Added ${filename} to staging area`, 'success');
    } else if (gitState.workingDirectory.includes(filename)) {
        addToTerminal(`git add ${filename}`, `No changes to ${filename}`, 'output');
    } else {
        addToTerminal(`git add ${filename}`, `pathspec '${filename}' did not match any files`, 'error');
    }
}

function gitCommit() {
    if (gitState.stagedFiles.length === 0) {
        addToTerminal('git commit', 'nothing to commit, working tree clean', 'output');
        return;
    }
    
    // Simulate opening editor for commit message
    const message = prompt('Enter commit message:') || 'Update files';
    commitWithMessage(message);
}

function gitCommitMessage(message) {
    if (gitState.stagedFiles.length === 0) {
        addToTerminal(`git commit -m "${message}"`, 'nothing to commit, working tree clean', 'output');
        return;
    }
    
    commitWithMessage(message);
}

function commitWithMessage(message) {
    const commitHash = generateHash();
    const currentBranch = getCurrentBranch();
    
    // Create new commit
    const newCommit = {
        hash: commitHash,
        message: message,
        author: `${gitState.config['user.name']} <${gitState.config['user.email']}>`,
        timestamp: new Date().toISOString(),
        files: [...gitState.stagedFiles],
        parent: currentBranch.head
    };
    
    // Add commit to current branch
    currentBranch.commits.push(newCommit);
    currentBranch.head = commitHash;
    
    // Clear staging area
    gitState.stagedFiles = [];
    
    const output = `[${gitState.currentBranch} ${commitHash}] ${message}\n ${newCommit.files.length} file(s) changed`;
    addToTerminal(`git commit -m "${message}"`, output, 'success');
}

function gitDiff() {
    if (gitState.modifiedFiles.length === 0) {
        addToTerminal('git diff', 'No changes in working directory', 'output');
        return;
    }
    
    let output = '';
    gitState.modifiedFiles.forEach(file => {
        output += `diff --git a/${file} b/${file}\n`;
        output += `index abc123..def456 100644\n`;
        output += `--- a/${file}\n`;
        output += `+++ b/${file}\n`;
        output += `@@ -1,3 +1,4 @@\n`;
        output += ` existing line\n`;
        output += `<span class="error">-removed line</span>\n`;
        output += `<span class="success">+added line</span>\n`;
        output += ` another line\n\n`;
    });
    
    addToTerminal('git diff', output, 'output');
}

function gitDiffStaged() {
    if (gitState.stagedFiles.length === 0) {
        addToTerminal('git diff --staged', 'No changes staged for commit', 'output');
        return;
    }
    
    let output = '';
    gitState.stagedFiles.forEach(file => {
        output += `diff --git a/${file} b/${file}\n`;
        output += `new file mode 100644\n`;
        output += `index 0000000..abc123\n`;
        output += `--- /dev/null\n`;
        output += `+++ b/${file}\n`;
        output += `@@ -0,0 +1,3 @@\n`;
        output += `<span class="success">+new file content</span>\n`;
        output += `<span class="success">+line 2</span>\n`;
        output += `<span class="success">+line 3</span>\n\n`;
    });
    
    addToTerminal('git diff --staged', output, 'output');
}
// Viewing History Commands
function gitLog() {
    const currentBranch = getCurrentBranch();
    let output = '';
    
    currentBranch.commits.slice().reverse().forEach(commit => {
        const date = new Date(commit.timestamp).toDateString();
        output += `<span style="color: #f39c12">commit ${commit.hash}</span>\n`;
        output += `Author: ${commit.author}\n`;
        output += `Date: ${date}\n\n`;
        output += `    ${commit.message}\n\n`;
    });
    
    if (output === '') {
        output = 'No commits yet';
    }
    
    addToTerminal('git log', output);
}

function gitLogOneline() {
    const currentBranch = getCurrentBranch();
    let output = '';
    
    currentBranch.commits.slice().reverse().forEach(commit => {
        output += `<span style="color: #f39c12">${commit.hash}</span> ${commit.message}\n`;
    });
    
    if (output === '') {
        output = 'No commits yet';
    }
    
    addToTerminal('git log --oneline', output);
}

function gitLogGraph() {
    const currentBranch = getCurrentBranch();
    let output = '';
    
    currentBranch.commits.slice().reverse().forEach((commit, index) => {
        const prefix = index === 0 ? '* ' : '* ';
        output += `${prefix}<span style="color: #f39c12">${commit.hash}</span> ${commit.message}\n`;
    });
    
    if (output === '') {
        output = 'No commits yet';
    }
    
    addToTerminal('git log --graph', output);
}

function gitShow(commitHash) {
    const currentBranch = getCurrentBranch();
    let commit;
    
    if (commitHash) {
        commit = currentBranch.commits.find(c => c.hash.startsWith(commitHash));
        if (!commit) {
            addToTerminal(`git show ${commitHash}`, `fatal: bad object ${commitHash}`, 'error');
            return;
        }
    } else {
        commit = currentBranch.commits[currentBranch.commits.length - 1];
    }
    
    const date = new Date(commit.timestamp).toDateString();
    let output = `<span style="color: #f39c12">commit ${commit.hash}</span>\n`;
    output += `Author: ${commit.author}\n`;
    output += `Date: ${date}\n\n`;
    output += `    ${commit.message}\n\n`;
    
    // Show diff
    commit.files.forEach(file => {
        output += `diff --git a/${file} b/${file}\n`;
        output += `new file mode 100644\n`;
        output += `index 0000000..abc123\n`;
        output += `--- /dev/null\n`;
        output += `+++ b/${file}\n`;
        output += `@@ -0,0 +1,3 @@\n`;
        output += `<span class="success">+file content</span>\n\n`;
    });
    
    addToTerminal(`git show ${commitHash || ''}`, output);
}

// Undoing Things Commands
function gitReset() {
    if (gitState.stagedFiles.length === 0) {
        addToTerminal('git reset', 'No staged changes to reset', 'output');
        return;
    }
    
    // Move staged files back to modified
    gitState.modifiedFiles = [...new Set([...gitState.modifiedFiles, ...gitState.stagedFiles])];
    const resetFiles = [...gitState.stagedFiles];
    gitState.stagedFiles = [];
    
    const output = `Unstaged changes after reset:\n${resetFiles.map(file => `M\t${file}`).join('\n')}`;
    addToTerminal('git reset', output, 'output');
}

function gitResetHard() {
    // Reset to last commit, losing all changes
    gitState.stagedFiles = [];
    gitState.modifiedFiles = [];
    gitState.untrackedFiles = [];
    
    const currentBranch = getCurrentBranch();
    const lastCommit = currentBranch.commits[currentBranch.commits.length - 1];
    gitState.workingDirectory = [...lastCommit.files];
    
    addToTerminal('git reset --hard', `HEAD is now at ${lastCommit.hash} ${lastCommit.message}`, 'warning');
}

function gitCheckoutFile(filename) {
    if (!filename) {
        addToTerminal('git checkout --', 'You must specify a file', 'error');
        return;
    }
    
    if (gitState.modifiedFiles.includes(filename)) {
        gitState.modifiedFiles = gitState.modifiedFiles.filter(f => f !== filename);
        addToTerminal(`git checkout -- ${filename}`, `Reverted changes to ${filename}`, 'success');
    } else {
        addToTerminal(`git checkout -- ${filename}`, `No changes to ${filename}`, 'output');
    }
}

function gitAmend() {
    const currentBranch = getCurrentBranch();
    if (currentBranch.commits.length === 0) {
        addToTerminal('git commit --amend', 'No commits to amend', 'error');
        return;
    }
    
    const lastCommit = currentBranch.commits[currentBranch.commits.length - 1];
    const newMessage = prompt('Enter new commit message:', lastCommit.message) || lastCommit.message;
    
    // Update last commit
    lastCommit.message = newMessage;
    lastCommit.files = [...new Set([...lastCommit.files, ...gitState.stagedFiles])];
    lastCommit.timestamp = new Date().toISOString();
    
    gitState.stagedFiles = [];
    
    addToTerminal('git commit --amend', `[${gitState.currentBranch} ${lastCommit.hash}] ${newMessage}`, 'success');
}

function gitRevert(commitHash) {
    const currentBranch = getCurrentBranch();
    const commit = currentBranch.commits.find(c => c.hash.startsWith(commitHash));
    
    if (!commit) {
        addToTerminal(`git revert ${commitHash}`, `fatal: bad object ${commitHash}`, 'error');
        return;
    }
    
    // Create revert commit
    const revertHash = generateHash();
    const revertCommit = {
        hash: revertHash,
        message: `Revert "${commit.message}"\n\nThis reverts commit ${commit.hash}.`,
        author: `${gitState.config['user.name']} <${gitState.config['user.email']}>`,
        timestamp: new Date().toISOString(),
        files: [],
        parent: currentBranch.head
    };
    
    currentBranch.commits.push(revertCommit);
    currentBranch.head = revertHash;
    
    addToTerminal(`git revert ${commitHash}`, `[${gitState.currentBranch} ${revertHash}] Revert "${commit.message}"`, 'success');
}
// Remote Repository Commands
function gitRemote() {
    let output = '';
    Object.keys(gitState.remotes).forEach(remoteName => {
        output += `${remoteName}\n`;
    });
    
    if (output === '') {
        output = 'No remotes configured';
    }
    
    addToTerminal('git remote', output);
}

function gitRemoteAdd(name, url) {
    if (gitState.remotes[name]) {
        addToTerminal(`git remote add ${name} ${url}`, `fatal: remote ${name} already exists.`, 'error');
        return;
    }
    
    gitState.remotes[name] = {
        url: url,
        branches: {}
    };
    
    addToTerminal(`git remote add ${name} ${url}`, `Added remote '${name}' at ${url}`, 'success');
}

function gitFetch() {
    const output = `From https://github.com/user/${gitState.repositoryName}\n * branch            main       -> FETCH_HEAD\nFetching objects: 100% (3/3), done.`;
    addToTerminal('git fetch', output, 'success');
}

function gitPull() {
    const output = `From https://github.com/user/${gitState.repositoryName}\n * branch            ${gitState.currentBranch}     -> FETCH_HEAD\nAlready up to date.`;
    addToTerminal('git pull', output, 'output');
}

function gitPush() {
    const currentBranch = getCurrentBranch();
    const remoteBranch = gitState.remotes.origin?.branches[gitState.currentBranch];
    
    if (!remoteBranch) {
        addToTerminal('git push', `fatal: The current branch ${gitState.currentBranch} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${gitState.currentBranch}`, 'error');
        return;
    }
    
    // Update remote branch
    gitState.remotes.origin.branches[gitState.currentBranch] = currentBranch.head;
    
    const output = `Enumerating objects: ${currentBranch.commits.length}, done.\nCounting objects: 100% (${currentBranch.commits.length}/${currentBranch.commits.length}), done.\nTo https://github.com/user/${gitState.repositoryName}.git\n   ${currentBranch.head}  ${gitState.currentBranch} -> ${gitState.currentBranch}`;
    
    addToTerminal('git push', output, 'success');
}

function gitPushUpstream() {
    const currentBranch = getCurrentBranch();
    
    // Set upstream and push
    gitState.remotes.origin.branches[gitState.currentBranch] = currentBranch.head;
    
    const output = `Enumerating objects: ${currentBranch.commits.length}, done.\nCounting objects: 100% (${currentBranch.commits.length}/${currentBranch.commits.length}), done.\nTo https://github.com/user/${gitState.repositoryName}.git\n * [new branch]      ${gitState.currentBranch} -> ${gitState.currentBranch}\nBranch '${gitState.currentBranch}' set up to track remote branch '${gitState.currentBranch}' from 'origin'.`;
    
    addToTerminal(`git push -u origin ${gitState.currentBranch}`, output, 'success');
}

// Branching Commands
function gitBranch() {
    let output = '';
    Object.keys(gitState.branches).forEach(branchName => {
        const prefix = branchName === gitState.currentBranch ? '* ' : '  ';
        const color = branchName === gitState.currentBranch ? 'color: #27ae60' : 'color: #ecf0f1';
        output += `<span style="${color}">${prefix}${branchName}</span>\n`;
    });
    
    addToTerminal('git branch', output);
}

function gitBranchCreate(branchName) {
    if (gitState.branches[branchName]) {
        addToTerminal(`git branch ${branchName}`, `fatal: A branch named '${branchName}' already exists.`, 'error');
        return;
    }
    
    // Create new branch from current branch
    const currentBranch = getCurrentBranch();
    gitState.branches[branchName] = {
        commits: [...currentBranch.commits],
        head: currentBranch.head
    };
    
    addToTerminal(`git branch ${branchName}`, `Created branch '${branchName}'`, 'success');
}

function gitCheckout(branchName) {
    if (!gitState.branches[branchName]) {
        addToTerminal(`git checkout ${branchName}`, `error: pathspec '${branchName}' did not match any file(s) known to git`, 'error');
        return;
    }
    
    if (branchName === gitState.currentBranch) {
        addToTerminal(`git checkout ${branchName}`, `Already on '${branchName}'`, 'output');
        return;
    }
    
    // Check for uncommitted changes
    if (gitState.modifiedFiles.length > 0 || gitState.stagedFiles.length > 0) {
        addToTerminal(`git checkout ${branchName}`, 'error: Your local changes would be overwritten by checkout.\nPlease commit your changes or stash them before you switch branches.', 'error');
        return;
    }
    
    gitState.currentBranch = branchName;
    
    // Update working directory to match branch state
    const targetBranch = getCurrentBranch();
    const latestCommit = targetBranch.commits[targetBranch.commits.length - 1];
    gitState.workingDirectory = [...latestCommit.files];
    
    addToTerminal(`git checkout ${branchName}`, `Switched to branch '${branchName}'`, 'success');
}

function gitCheckoutNew(branchName) {
    if (gitState.branches[branchName]) {
        addToTerminal(`git checkout -b ${branchName}`, `fatal: A branch named '${branchName}' already exists.`, 'error');
        return;
    }
    
    // Create and checkout new branch
    const currentBranch = getCurrentBranch();
    gitState.branches[branchName] = {
        commits: [...currentBranch.commits],
        head: currentBranch.head
    };
    
    gitState.currentBranch = branchName;
    
    addToTerminal(`git checkout -b ${branchName}`, `Switched to a new branch '${branchName}'`, 'success');
}

function gitMerge(branchName) {
    if (!gitState.branches[branchName]) {
        addToTerminal(`git merge ${branchName}`, `merge: ${branchName} - not something we can merge`, 'error');
        return;
    }
    
    if (branchName === gitState.currentBranch) {
        addToTerminal(`git merge ${branchName}`, `Already up to date.`, 'output');
        return;
    }
    
    const currentBranch = getCurrentBranch();
    const mergeBranch = gitState.branches[branchName];
    
    // Simple merge - add commits from merge branch that aren't in current branch
    const currentCommitHashes = currentBranch.commits.map(c => c.hash);
    const newCommits = mergeBranch.commits.filter(c => !currentCommitHashes.includes(c.hash));
    
    if (newCommits.length === 0) {
        addToTerminal(`git merge ${branchName}`, `Already up to date.`, 'output');
        return;
    }
    
    // Add new commits to current branch
    currentBranch.commits.push(...newCommits);
    
    // Create merge commit
    const mergeCommitHash = generateHash();
    const mergeCommit = {
        hash: mergeCommitHash,
        message: `Merge branch '${branchName}'`,
        author: `${gitState.config['user.name']} <${gitState.config['user.email']}>`,
        timestamp: new Date().toISOString(),
        files: [...new Set([...currentBranch.commits[currentBranch.commits.length - 2].files, ...mergeBranch.commits[mergeBranch.commits.length - 1].files])],
        parent: currentBranch.head,
        isMerge: true,
        mergedFrom: branchName
    };
    
    currentBranch.commits.push(mergeCommit);
    currentBranch.head = mergeCommitHash;
    
    // Update working directory
    gitState.workingDirectory = [...mergeCommit.files];
    
    const output = `Merge made by the 'recursive' strategy.\n ${newCommits.length} file(s) changed from '${branchName}'`;
    
    addToTerminal(`git merge ${branchName}`, output, 'success');
}

function gitBranchDelete(branchName) {
    if (!gitState.branches[branchName]) {
        addToTerminal(`git branch -d ${branchName}`, `error: branch '${branchName}' not found.`, 'error');
        return;
    }
    
    if (branchName === gitState.currentBranch) {
        addToTerminal(`git branch -d ${branchName}`, `error: Cannot delete branch '${branchName}' checked out at '/path/to/repo'`, 'error');
        return;
    }
    
    delete gitState.branches[branchName];
    addToTerminal(`git branch -d ${branchName}`, `Deleted branch ${branchName}.`, 'success');
}
// Tagging Commands
function gitTag(tagName, message) {
    if (!tagName) {
        // List all tags
        let output = '';
        Object.keys(gitState.tags).forEach(tag => {
            output += `${tag}\n`;
        });
        
        if (output === '') {
            output = 'No tags found';
        }
        
        addToTerminal('git tag', output);
        return;
    }
    
    if (gitState.tags[tagName]) {
        addToTerminal(`git tag ${tagName}`, `fatal: tag '${tagName}' already exists`, 'error');
        return;
    }
    
    const currentBranch = getCurrentBranch();
    gitState.tags[tagName] = {
        commit: currentBranch.head,
        message: message || '',
        tagger: `${gitState.config['user.name']} <${gitState.config['user.email']}>`,
        timestamp: new Date().toISOString()
    };
    
    addToTerminal(`git tag ${tagName}`, `Created tag '${tagName}'`, 'success');
}

function gitTagAnnotated(tagName, message) {
    if (!message) {
        message = prompt(`Enter message for tag '${tagName}':`) || `Tag ${tagName}`;
    }
    
    gitTag(tagName, message);
}

function gitPushTags() {
    const tagCount = Object.keys(gitState.tags).length;
    if (tagCount === 0) {
        addToTerminal('git push --tags', 'Everything up-to-date', 'output');
        return;
    }
    
    const output = `Enumerating objects: ${tagCount}, done.\nTo https://github.com/user/${gitState.repositoryName}.git\n${Object.keys(gitState.tags).map(tag => ` * [new tag]         ${tag} -> ${tag}`).join('\n')}`;
    
    addToTerminal('git push --tags', output, 'success');
}

// Stash Commands
function gitStash() {
    if (gitState.modifiedFiles.length === 0 && gitState.stagedFiles.length === 0) {
        addToTerminal('git stash', 'No local changes to save', 'output');
        return;
    }
    
    const stashEntry = {
        id: gitState.stash.length,
        message: `WIP on ${gitState.currentBranch}: ${getCurrentBranch().head} ${getCurrentBranch().commits[getCurrentBranch().commits.length - 1].message}`,
        modifiedFiles: [...gitState.modifiedFiles],
        stagedFiles: [...gitState.stagedFiles],
        timestamp: new Date().toISOString()
    };
    
    gitState.stash.push(stashEntry);
    gitState.modifiedFiles = [];
    gitState.stagedFiles = [];
    
    addToTerminal('git stash', `Saved working directory and index state ${stashEntry.message}`, 'success');
}

function gitStashPop() {
    if (gitState.stash.length === 0) {
        addToTerminal('git stash pop', 'No stash entries found.', 'error');
        return;
    }
    
    const stashEntry = gitState.stash.pop();
    gitState.modifiedFiles = [...stashEntry.modifiedFiles];
    gitState.stagedFiles = [...stashEntry.stagedFiles];
    
    addToTerminal('git stash pop', `Dropped refs/stash@{0} (${stashEntry.message.substring(0, 50)}...)`, 'success');
}

// Advanced Branching Commands
function gitRebase(targetBranch) {
    if (!gitState.branches[targetBranch]) {
        addToTerminal(`git rebase ${targetBranch}`, `fatal: invalid upstream '${targetBranch}'`, 'error');
        return;
    }
    
    const currentBranch = getCurrentBranch();
    const target = gitState.branches[targetBranch];
    
    // Simple rebase simulation
    const targetCommitHashes = target.commits.map(c => c.hash);
    const commitsToRebase = currentBranch.commits.filter(c => !targetCommitHashes.includes(c.hash));
    
    if (commitsToRebase.length === 0) {
        addToTerminal(`git rebase ${targetBranch}`, 'Current branch is up to date.', 'output');
        return;
    }
    
    // Rebase commits
    currentBranch.commits = [...target.commits, ...commitsToRebase];
    currentBranch.head = commitsToRebase[commitsToRebase.length - 1].hash;
    
    addToTerminal(`git rebase ${targetBranch}`, `Successfully rebased and updated refs/heads/${gitState.currentBranch}.`, 'success');
}

function gitRebaseInteractive() {
    const currentBranch = getCurrentBranch();
    if (currentBranch.commits.length <= 1) {
        addToTerminal('git rebase -i', 'Nothing to rebase', 'output');
        return;
    }
    
    addToTerminal('git rebase -i', 'Interactive rebase started (simulated)', 'success');
}

function gitCherryPick(commitHash) {
    // Find commit in any branch
    let sourceCommit = null;
    Object.values(gitState.branches).forEach(branch => {
        const commit = branch.commits.find(c => c.hash.startsWith(commitHash));
        if (commit) sourceCommit = commit;
    });
    
    if (!sourceCommit) {
        addToTerminal(`git cherry-pick ${commitHash}`, `fatal: bad object ${commitHash}`, 'error');
        return;
    }
    
    // Create new commit with same changes
    const newHash = generateHash();
    const cherryPickCommit = {
        hash: newHash,
        message: sourceCommit.message,
        author: sourceCommit.author,
        timestamp: new Date().toISOString(),
        files: [...sourceCommit.files],
        parent: getCurrentBranch().head
    };
    
    const currentBranch = getCurrentBranch();
    currentBranch.commits.push(cherryPickCommit);
    currentBranch.head = newHash;
    
    addToTerminal(`git cherry-pick ${commitHash}`, `[${gitState.currentBranch} ${newHash}] ${sourceCommit.message}`, 'success');
}

// File Management Functions
function createFile() {
    const fileName = prompt('Enter file name:');
    if (fileName && !gitState.workingDirectory.includes(fileName)) {
        gitState.workingDirectory.push(fileName);
        gitState.untrackedFiles.push(fileName);
        updateDisplay();
        addToTerminal(`touch ${fileName}`, `Created ${fileName}`, 'success');
    }
}

function modifyFile() {
    const fileName = prompt('Enter file name to modify:', gitState.workingDirectory[0]);
    if (fileName && gitState.workingDirectory.includes(fileName)) {
        if (!gitState.modifiedFiles.includes(fileName) && !gitState.stagedFiles.includes(fileName)) {
            gitState.modifiedFiles.push(fileName);
            // Remove from untracked if it was there
            gitState.untrackedFiles = gitState.untrackedFiles.filter(f => f !== fileName);
            updateDisplay();
            addToTerminal(`nano ${fileName}`, `Modified ${fileName}`, 'success');
        }
    }
}

function deleteFile() {
    const fileName = prompt('Enter file name to delete:', gitState.workingDirectory[0]);
    if (fileName && gitState.workingDirectory.includes(fileName)) {
        gitState.workingDirectory = gitState.workingDirectory.filter(f => f !== fileName);
        gitState.deletedFiles.push(fileName);
        // Remove from other arrays
        gitState.modifiedFiles = gitState.modifiedFiles.filter(f => f !== fileName);
        gitState.untrackedFiles = gitState.untrackedFiles.filter(f => f !== fileName);
        gitState.stagedFiles = gitState.stagedFiles.filter(f => f !== fileName);
        updateDisplay();
        addToTerminal(`rm ${fileName}`, `Deleted ${fileName}`, 'warning');
    }
}

// Display Update Functions
function updateFileAreas() {
    // Update untracked files
    const untrackedDiv = document.getElementById('untracked-files');
    untrackedDiv.innerHTML = '';
    gitState.untrackedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.textContent = file;
        fileDiv.onclick = () => {
            gitState.stagedFiles.push(file);
            gitState.untrackedFiles = gitState.untrackedFiles.filter(f => f !== file);
            updateDisplay();
        };
        untrackedDiv.appendChild(fileDiv);
    });
    
    // Update modified files
    const modifiedDiv = document.getElementById('modified-files');
    modifiedDiv.innerHTML = '';
    gitState.modifiedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.textContent = file;
        fileDiv.onclick = () => {
            gitState.stagedFiles.push(file);
            gitState.modifiedFiles = gitState.modifiedFiles.filter(f => f !== file);
            updateDisplay();
        };
        modifiedDiv.appendChild(fileDiv);
    });
    
    // Update staged files
    const stagedDiv = document.getElementById('staged-files');
    stagedDiv.innerHTML = '';
    gitState.stagedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.textContent = file;
        fileDiv.onclick = () => {
            gitState.modifiedFiles.push(file);
            gitState.stagedFiles = gitState.stagedFiles.filter(f => f !== file);
            updateDisplay();
        };
        stagedDiv.appendChild(fileDiv);
    });
    
    // Update committed files
    const committedDiv = document.getElementById('committed-files');
    committedDiv.innerHTML = '';
    const currentBranch = getCurrentBranch();
    if (currentBranch.commits.length > 0) {
        const latestCommit = currentBranch.commits[currentBranch.commits.length - 1];
        latestCommit.files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.textContent = file;
            committedDiv.appendChild(fileDiv);
        });
    }
}

function updateBranchGraph() {
    const graphContainer = document.getElementById('branch-graph');
    graphContainer.innerHTML = '';
    
    Object.keys(gitState.branches).forEach(branchName => {
        const branchContainer = document.createElement('div');
        branchContainer.className = 'branch-container';
        
        // Branch name
        const branchNameDiv = document.createElement('div');
        branchNameDiv.className = `branch-name ${branchName === gitState.currentBranch ? 'active' : ''}`;
        branchNameDiv.textContent = branchName;
        branchContainer.appendChild(branchNameDiv);
        
        // Branch line with commits
        const branchLine = document.createElement('div');
        branchLine.className = `branch-line ${branchName}`;
        
        const branch = gitState.branches[branchName];
        branch.commits.forEach((commit, index) => {
            const commitDiv = document.createElement('div');
            commitDiv.className = `commit ${index === 0 ? 'initial' : ''} ${commit.isMerge ? 'merge' : ''}`;
            commitDiv.title = `${commit.hash}: ${commit.message}`;
            
            const commitDot = document.createElement('div');
            commitDot.className = 'commit-dot';
            
            const commitInfo = document.createElement('div');
            commitInfo.className = 'commit-info';
            commitInfo.textContent = commit.hash;
            
            commitDiv.appendChild(commitDot);
            commitDiv.appendChild(commitInfo);
            branchLine.appendChild(commitDiv);
        });
        
        branchContainer.appendChild(branchLine);
        graphContainer.appendChild(branchContainer);
    });
}

function updateRemoteDisplay() {
    const originBranches = document.getElementById('origin-branches');
    originBranches.innerHTML = '';
    
    if (gitState.remotes.origin) {
        Object.keys(gitState.remotes.origin.branches).forEach(branchName => {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'remote-branch';
            branchDiv.textContent = `origin/${branchName}`;
            originBranches.appendChild(branchDiv);
        });
    }
}

function updateTagsDisplay() {
    const tagsList = document.getElementById('tags-list');
    tagsList.innerHTML = '';
    
    Object.keys(gitState.tags).forEach(tagName => {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag-item';
        tagDiv.textContent = tagName;
        tagDiv.title = gitState.tags[tagName].message;
        tagsList.appendChild(tagDiv);
    });
}

function updateStashDisplay() {
    const stashList = document.getElementById('stash-list');
    stashList.innerHTML = '';
    
    gitState.stash.forEach((stashEntry, index) => {
        const stashDiv = document.createElement('div');
        stashDiv.className = 'stash-item';
        stashDiv.textContent = `stash@{${index}}`;
        stashDiv.title = stashEntry.message;
        stashList.appendChild(stashDiv);
    });
}

// Help System
function showConcept(conceptName) {
    // Hide all concept panels
    document.querySelectorAll('.concept-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected concept panel
    document.getElementById(`${conceptName}-content`).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Initialize the simulator
function initializeSimulator() {
    updateDisplay();
    
    // Add some sample untracked files
    gitState.untrackedFiles.push('app.js', 'config.json');
    gitState.workingDirectory.push('app.js', 'config.json');
    
    updateDisplay();
}

// Start the simulator when page loads
document.addEventListener('DOMContentLoaded', initializeSimulator);
// Add missing button handler functions that were referenced in HTML but not implemented

// Button handlers that call the main functions
function gitCommitMessage() {
    const message = prompt('Enter commit message:');
    if (message) {
        commitWithMessage(message);
    }
}

function gitLogOneline() {
    const currentBranch = getCurrentBranch();
    let output = '';
    
    currentBranch.commits.slice().reverse().forEach(commit => {
        output += `<span style="color: #f39c12">${commit.hash}</span> ${commit.message}\n`;
    });
    
    if (output === '') {
        output = 'No commits yet';
    }
    
    addToTerminal('git log --oneline', output);
}

function gitLogGraph() {
    const currentBranch = getCurrentBranch();
    let output = '';
    
    currentBranch.commits.slice().reverse().forEach((commit, index) => {
        const prefix = '* ';
        output += `${prefix}<span style="color: #f39c12">${commit.hash}</span> ${commit.message}\n`;
    });
    
    if (output === '') {
        output = 'No commits yet';
    }
    
    addToTerminal('git log --graph', output);
}

function gitShow() {
    const currentBranch = getCurrentBranch();
    if (currentBranch.commits.length === 0) {
        addToTerminal('git show', 'No commits yet', 'output');
        return;
    }
    
    const commit = currentBranch.commits[currentBranch.commits.length - 1];
    const date = new Date(commit.timestamp).toDateString();
    let output = `<span style="color: #f39c12">commit ${commit.hash}</span>\n`;
    output += `Author: ${commit.author}\n`;
    output += `Date: ${date}\n\n`;
    output += `    ${commit.message}\n\n`;
    
    addToTerminal('git show', output);
}

function gitAddFile() {
    const filename = prompt('Enter filename to add:');
    if (filename) {
        gitAddFileByName(filename);
    }
}

function gitAddFileByName(filename) {
    if (!filename) {
        addToTerminal('git add', 'Nothing specified, nothing added.', 'error');
        return;
    }
    
    if (gitState.modifiedFiles.includes(filename)) {
        gitState.stagedFiles.push(filename);
        gitState.modifiedFiles = gitState.modifiedFiles.filter(f => f !== filename);
        addToTerminal(`git add ${filename}`, `Added ${filename} to staging area`, 'success');
    } else if (gitState.untrackedFiles.includes(filename)) {
        gitState.stagedFiles.push(filename);
        gitState.untrackedFiles = gitState.untrackedFiles.filter(f => f !== filename);
        addToTerminal(`git add ${filename}`, `Added ${filename} to staging area`, 'success');
    } else if (gitState.workingDirectory.includes(filename)) {
        addToTerminal(`git add ${filename}`, `No changes to ${filename}`, 'output');
    } else {
        addToTerminal(`git add ${filename}`, `pathspec '${filename}' did not match any files`, 'error');
    }
    updateDisplay();
}

function gitCheckoutFile() {
    const filename = prompt('Enter filename to checkout:');
    if (filename) {
        if (gitState.modifiedFiles.includes(filename)) {
            gitState.modifiedFiles = gitState.modifiedFiles.filter(f => f !== filename);
            addToTerminal(`git checkout -- ${filename}`, `Reverted changes to ${filename}`, 'success');
            updateDisplay();
        } else {
            addToTerminal(`git checkout -- ${filename}`, `No changes to ${filename}`, 'output');
        }
    }
}

function gitRemoteAdd() {
    const name = prompt('Enter remote name:', 'origin');
    const url = prompt('Enter remote URL:', 'https://github.com/user/repo.git');
    if (name && url) {
        if (gitState.remotes[name]) {
            addToTerminal(`git remote add ${name} ${url}`, `fatal: remote ${name} already exists.`, 'error');
            return;
        }
        
        gitState.remotes[name] = {
            url: url,
            branches: {}
        };
        
        addToTerminal(`git remote add ${name} ${url}`, `Added remote '${name}' at ${url}`, 'success');
        updateDisplay();
    }
}

function gitTagAnnotated() {
    const tagName = prompt('Enter tag name:');
    if (tagName) {
        const message = prompt(`Enter message for tag '${tagName}':`) || `Tag ${tagName}`;
        gitTag(tagName, message);
    }
}

function gitTagShow() {
    const tagName = prompt('Enter tag name to show:');
    if (tagName && gitState.tags[tagName]) {
        const tag = gitState.tags[tagName];
        let output = `tag ${tagName}\n`;
        output += `Tagger: ${tag.tagger}\n`;
        output += `Date: ${new Date(tag.timestamp).toDateString()}\n\n`;
        output += `${tag.message}\n`;
        
        addToTerminal(`git show ${tagName}`, output);
    } else if (tagName) {
        addToTerminal(`git show ${tagName}`, `fatal: bad object ${tagName}`, 'error');
    }
}

function gitBranchCreate() {
    const branchName = prompt('Enter new branch name:');
    if (branchName) {
        if (gitState.branches[branchName]) {
            addToTerminal(`git branch ${branchName}`, `fatal: A branch named '${branchName}' already exists.`, 'error');
            return;
        }
        
        // Create new branch from current branch
        const currentBranch = getCurrentBranch();
        gitState.branches[branchName] = {
            commits: [...currentBranch.commits],
            head: currentBranch.head
        };
        
        addToTerminal(`git branch ${branchName}`, `Created branch '${branchName}'`, 'success');
        updateDisplay();
    }
}

function gitCheckout() {
    const branchName = prompt('Enter branch name to checkout:');
    if (branchName) {
        gitCheckoutBranch(branchName);
    }
}

function gitCheckoutBranch(branchName) {
    if (!gitState.branches[branchName]) {
        addToTerminal(`git checkout ${branchName}`, `error: pathspec '${branchName}' did not match any file(s) known to git`, 'error');
        return;
    }
    
    if (branchName === gitState.currentBranch) {
        addToTerminal(`git checkout ${branchName}`, `Already on '${branchName}'`, 'output');
        return;
    }
    
    // Check for uncommitted changes
    if (gitState.modifiedFiles.length > 0 || gitState.stagedFiles.length > 0) {
        addToTerminal(`git checkout ${branchName}`, 'error: Your local changes would be overwritten by checkout.\nPlease commit your changes or stash them before you switch branches.', 'error');
        return;
    }
    
    gitState.currentBranch = branchName;
    
    // Update working directory to match branch state
    const targetBranch = getCurrentBranch();
    const latestCommit = targetBranch.commits[targetBranch.commits.length - 1];
    gitState.workingDirectory = [...latestCommit.files];
    
    addToTerminal(`git checkout ${branchName}`, `Switched to branch '${branchName}'`, 'success');
    updateDisplay();
}

function gitCheckoutNew() {
    const branchName = prompt('Enter new branch name:');
    if (branchName) {
        if (gitState.branches[branchName]) {
            addToTerminal(`git checkout -b ${branchName}`, `fatal: A branch named '${branchName}' already exists.`, 'error');
            return;
        }
        
        // Create and checkout new branch
        const currentBranch = getCurrentBranch();
        gitState.branches[branchName] = {
            commits: [...currentBranch.commits],
            head: currentBranch.head
        };
        
        gitState.currentBranch = branchName;
        
        addToTerminal(`git checkout -b ${branchName}`, `Switched to a new branch '${branchName}'`, 'success');
        updateDisplay();
    }
}

function gitMerge() {
    const branchName = prompt('Enter branch name to merge:');
    if (branchName) {
        gitMergeBranch(branchName);
    }
}

function gitMergeBranch(branchName) {
    if (!gitState.branches[branchName]) {
        addToTerminal(`git merge ${branchName}`, `merge: ${branchName} - not something we can merge`, 'error');
        return;
    }
    
    if (branchName === gitState.currentBranch) {
        addToTerminal(`git merge ${branchName}`, `Already up to date.`, 'output');
        return;
    }
    
    const currentBranch = getCurrentBranch();
    const mergeBranch = gitState.branches[branchName];
    
    // Simple merge - add commits from merge branch that aren't in current branch
    const currentCommitHashes = currentBranch.commits.map(c => c.hash);
    const newCommits = mergeBranch.commits.filter(c => !currentCommitHashes.includes(c.hash));
    
    if (newCommits.length === 0) {
        addToTerminal(`git merge ${branchName}`, `Already up to date.`, 'output');
        return;
    }
    
    // Add new commits to current branch
    currentBranch.commits.push(...newCommits);
    
    // Create merge commit
    const mergeCommitHash = generateHash();
    const mergeCommit = {
        hash: mergeCommitHash,
        message: `Merge branch '${branchName}'`,
        author: `${gitState.config['user.name']} <${gitState.config['user.email']}>`,
        timestamp: new Date().toISOString(),
        files: [...new Set([...currentBranch.commits[currentBranch.commits.length - 2].files, ...mergeBranch.commits[mergeBranch.commits.length - 1].files])],
        parent: currentBranch.head,
        isMerge: true,
        mergedFrom: branchName
    };
    
    currentBranch.commits.push(mergeCommit);
    currentBranch.head = mergeCommitHash;
    
    // Update working directory
    gitState.workingDirectory = [...mergeCommit.files];
    
    const output = `Merge made by the 'recursive' strategy.\n ${newCommits.length} file(s) changed from '${branchName}'`;
    
    addToTerminal(`git merge ${branchName}`, output, 'success');
    updateDisplay();
}

function gitBranchDelete() {
    const branchName = prompt('Enter branch name to delete:');
    if (branchName) {
        if (!gitState.branches[branchName]) {
            addToTerminal(`git branch -d ${branchName}`, `error: branch '${branchName}' not found.`, 'error');
            return;
        }
        
        if (branchName === gitState.currentBranch) {
            addToTerminal(`git branch -d ${branchName}`, `error: Cannot delete branch '${branchName}' checked out at '/path/to/repo'`, 'error');
            return;
        }
        
        delete gitState.branches[branchName];
        addToTerminal(`git branch -d ${branchName}`, `Deleted branch ${branchName}.`, 'success');
        updateDisplay();
    }
}

function gitRebase() {
    const targetBranch = prompt('Enter branch to rebase onto:');
    if (targetBranch) {
        gitRebaseBranch(targetBranch);
    }
}

function gitRebaseBranch(targetBranch) {
    if (!gitState.branches[targetBranch]) {
        addToTerminal(`git rebase ${targetBranch}`, `fatal: invalid upstream '${targetBranch}'`, 'error');
        return;
    }
    
    const currentBranch = getCurrentBranch();
    const target = gitState.branches[targetBranch];
    
    // Simple rebase simulation
    const targetCommitHashes = target.commits.map(c => c.hash);
    const commitsToRebase = currentBranch.commits.filter(c => !targetCommitHashes.includes(c.hash));
    
    if (commitsToRebase.length === 0) {
        addToTerminal(`git rebase ${targetBranch}`, 'Current branch is up to date.', 'output');
        return;
    }
    
    // Rebase commits
    currentBranch.commits = [...target.commits, ...commitsToRebase];
    currentBranch.head = commitsToRebase[commitsToRebase.length - 1].hash;
    
    addToTerminal(`git rebase ${targetBranch}`, `Successfully rebased and updated refs/heads/${gitState.currentBranch}.`, 'success');
    updateDisplay();
}

function gitRebaseInteractive() {
    const currentBranch = getCurrentBranch();
    if (currentBranch.commits.length <= 1) {
        addToTerminal('git rebase -i', 'Nothing to rebase', 'output');
        return;
    }
    
    addToTerminal('git rebase -i', 'Interactive rebase started (simulated)', 'success');
}

function gitCherryPick() {
    const commitHash = prompt('Enter commit hash to cherry-pick:');
    if (commitHash) {
        gitCherryPickCommit(commitHash);
    }
}

function gitCherryPickCommit(commitHash) {
    // Find commit in any branch
    let sourceCommit = null;
    Object.values(gitState.branches).forEach(branch => {
        const commit = branch.commits.find(c => c.hash.startsWith(commitHash));
        if (commit) sourceCommit = commit;
    });
    
    if (!sourceCommit) {
        addToTerminal(`git cherry-pick ${commitHash}`, `fatal: bad object ${commitHash}`, 'error');
        return;
    }
    
    // Create new commit with same changes
    const newHash = generateHash();
    const cherryPickCommit = {
        hash: newHash,
        message: sourceCommit.message,
        author: sourceCommit.author,
        timestamp: new Date().toISOString(),
        files: [...sourceCommit.files],
        parent: getCurrentBranch().head
    };
    
    const currentBranch = getCurrentBranch();
    currentBranch.commits.push(cherryPickCommit);
    currentBranch.head = newHash;
    
    addToTerminal(`git cherry-pick ${commitHash}`, `[${gitState.currentBranch} ${newHash}] ${sourceCommit.message}`, 'success');
    updateDisplay();
}
