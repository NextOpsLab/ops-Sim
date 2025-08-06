// Git simulator state
let gitState = {
    currentBranch: 'main',
    branches: {
        main: {
            commits: [
                {
                    hash: 'a1b2c3d',
                    message: 'Initial commit',
                    files: ['README.md', 'index.js'],
                    timestamp: new Date().toISOString()
                }
            ],
            head: 'a1b2c3d'
        }
    },
    stagedFiles: [],
    modifiedFiles: [],
    committedFiles: ['README.md', 'index.js'],
    workingDirectory: ['README.md', 'index.js'],
    originalFiles: {} // Store original file states for revert
};

// Helper functions
function getCurrentBranch() {
    return gitState.branches[gitState.currentBranch];
}

function updateBranchDisplay() {
    document.getElementById('current-branch').textContent = gitState.currentBranch;
}

// Terminal functions
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
    
    // Update visual displays
    updateFileDisplay();
    updateGitGraph();
    updateBranchDisplay();
}

function clearTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.innerHTML = '<div class="prompt">$ git status</div><div class="output">On branch main<br>nothing to commit, working tree clean</div>';
}

// Git command simulations
function gitStatus() {
    let output = `On branch ${gitState.currentBranch}\n`;
    
    if (gitState.stagedFiles.length > 0) {
        output += '\nChanges to be committed:\n  (use "git reset HEAD <file>..." to unstage)\n';
        gitState.stagedFiles.forEach(file => {
            output += `\t<span class="success">new file:   ${file}</span>\n`;
        });
    }
    
    if (gitState.modifiedFiles.length > 0) {
        output += '\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git checkout -- <file>..." to discard changes)\n';
        gitState.modifiedFiles.forEach(file => {
            output += `\t<span style="color: #e74c3c">modified:   ${file}</span>\n`;
        });
    }
    
    if (gitState.stagedFiles.length === 0 && gitState.modifiedFiles.length === 0) {
        output += 'nothing to commit, working tree clean';
    }
    
    addToTerminal('git status', output);
}

function gitAdd() {
    if (gitState.modifiedFiles.length === 0) {
        addToTerminal('git add .', 'No changes to add', 'output');
        return;
    }
    
    // Store original states for potential revert
    gitState.modifiedFiles.forEach(file => {
        if (!gitState.originalFiles[file]) {
            gitState.originalFiles[file] = 'original state';
        }
    });
    
    // Move modified files to staged
    gitState.stagedFiles = [...gitState.stagedFiles, ...gitState.modifiedFiles];
    gitState.modifiedFiles = [];
    
    addToTerminal('git add .', 'Changes staged for commit', 'success');
}

function gitCommit() {
    if (gitState.stagedFiles.length === 0) {
        addToTerminal('git commit', 'nothing to commit, working tree clean', 'output');
        return;
    }
    
    const commitMessage = `Add ${gitState.stagedFiles.join(', ')}`;
    const commitHash = Math.random().toString(36).substr(2, 7);
    
    // Create commit
    const newCommit = {
        hash: commitHash,
        message: commitMessage,
        files: [...gitState.stagedFiles],
        timestamp: new Date().toISOString()
    };
    
    // Add commit to current branch
    getCurrentBranch().commits.push(newCommit);
    getCurrentBranch().head = commitHash;
    
    // Move staged files to committed
    gitState.committedFiles = [...new Set([...gitState.committedFiles, ...gitState.stagedFiles])];
    gitState.stagedFiles = [];
    
    // Clear original states for committed files
    newCommit.files.forEach(file => {
        delete gitState.originalFiles[file];
    });
    
    const output = `[${gitState.currentBranch} ${commitHash}] ${commitMessage}\n ${newCommit.files.length} file(s) changed`;
    
    addToTerminal('git commit', output, 'success');
}

function gitPush() {
    const currentBranch = getCurrentBranch();
    if (currentBranch.commits.length <= 1) {
        addToTerminal('git push', 'Everything up-to-date', 'output');
        return;
    }
    
    const latestCommit = currentBranch.commits[currentBranch.commits.length - 1];
    const output = `Enumerating objects: ${currentBranch.commits.length}, done.\nCounting objects: 100% (${currentBranch.commits.length}/${currentBranch.commits.length}), done.\nTo https://github.com/user/repo.git\n   ${latestCommit.hash}  ${gitState.currentBranch} -> ${gitState.currentBranch}`;
    
    addToTerminal('git push', output, 'success');
}

function gitPull() {
    const output = `From https://github.com/user/repo\n * branch            ${gitState.currentBranch}     -> FETCH_HEAD\nAlready up to date.`;
    addToTerminal('git pull', output, 'output');
}

function gitLog() {
    let output = '';
    const currentBranch = getCurrentBranch();
    
    currentBranch.commits.slice().reverse().forEach((commit, index) => {
        const date = new Date(commit.timestamp).toDateString();
        output += `<span style="color: #f39c12">commit ${commit.hash}</span>\n`;
        output += `Date: ${date}\n\n`;
        output += `    ${commit.message}\n\n`;
    });
    
    if (output === '') {
        output = 'No commits yet';
    }
    
    addToTerminal('git log', output);
}

function gitReset() {
    if (gitState.stagedFiles.length === 0) {
        addToTerminal('git reset', 'No staged changes to reset', 'output');
        return;
    }
    
    // Move staged files back to modified
    gitState.modifiedFiles = [...gitState.modifiedFiles, ...gitState.stagedFiles];
    const resetFiles = [...gitState.stagedFiles];
    gitState.stagedFiles = [];
    
    const output = `Unstaged changes after reset:\n${resetFiles.map(file => `M\t${file}`).join('\n')}`;
    
    addToTerminal('git reset', output, 'output');
}

function gitRevert() {
    if (gitState.modifiedFiles.length === 0) {
        addToTerminal('git checkout .', 'No changes to revert', 'output');
        return;
    }
    
    const revertedFiles = [...gitState.modifiedFiles];
    
    // Remove modified files that aren't committed
    gitState.modifiedFiles.forEach(file => {
        if (!gitState.committedFiles.includes(file)) {
            // Remove from working directory if it's a new file
            const index = gitState.workingDirectory.indexOf(file);
            if (index > -1) {
                gitState.workingDirectory.splice(index, 1);
            }
        }
    });
    
    gitState.modifiedFiles = [];
    
    // Clear original states
    revertedFiles.forEach(file => {
        delete gitState.originalFiles[file];
    });
    
    const output = `Reverted changes in:\n${revertedFiles.join('\n')}`;
    
    addToTerminal('git checkout .', output, 'success');
}

// Branch management functions
function gitBranch() {
    let output = '';
    Object.keys(gitState.branches).forEach(branchName => {
        const prefix = branchName === gitState.currentBranch ? '* ' : '  ';
        const color = branchName === gitState.currentBranch ? 'color: #27ae60' : 'color: #ecf0f1';
        output += `<span style="${color}">${prefix}${branchName}</span>\n`;
    });
    
    addToTerminal('git branch', output);
}

function createBranch() {
    const branchName = prompt('Enter new branch name:');
    if (!branchName) return;
    
    if (gitState.branches[branchName]) {
        addToTerminal(`git branch ${branchName}`, `fatal: A branch named '${branchName}' already exists.`, 'error');
        return;
    }
    
    // Create new branch from current branch
    const currentBranch = getCurrentBranch();
    gitState.branches[branchName] = {
        commits: [...currentBranch.commits], // Copy commits from current branch
        head: currentBranch.head
    };
    
    addToTerminal(`git branch ${branchName}`, `Created branch '${branchName}'`, 'success');
}

function checkoutBranch() {
    const branchName = prompt('Enter branch name to checkout:');
    if (!branchName) return;
    
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
    gitState.committedFiles = [...latestCommit.files];
    gitState.workingDirectory = [...latestCommit.files];
    
    addToTerminal(`git checkout ${branchName}`, `Switched to branch '${branchName}'`, 'success');
}

function mergeBranch() {
    const branchName = prompt('Enter branch name to merge:');
    if (!branchName) return;
    
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
    const mergeCommitHash = Math.random().toString(36).substr(2, 7);
    const mergeCommit = {
        hash: mergeCommitHash,
        message: `Merge branch '${branchName}'`,
        files: [...new Set([...currentBranch.commits[currentBranch.commits.length - 2].files, ...mergeBranch.commits[mergeBranch.commits.length - 1].files])],
        timestamp: new Date().toISOString(),
        isMerge: true,
        mergedFrom: branchName
    };
    
    currentBranch.commits.push(mergeCommit);
    currentBranch.head = mergeCommitHash;
    
    // Update working directory
    gitState.committedFiles = [...mergeCommit.files];
    gitState.workingDirectory = [...mergeCommit.files];
    
    const output = `Merge made by the 'recursive' strategy.\n ${newCommits.length} file(s) changed from '${branchName}'`;
    
    addToTerminal(`git merge ${branchName}`, output, 'success');
}

// Visual update functions
function updateGitGraph() {
    const graphContainer = document.getElementById('graph-container');
    graphContainer.innerHTML = '';
    
    // Create branch containers
    Object.keys(gitState.branches).forEach(branchName => {
        const branchContainer = document.createElement('div');
        branchContainer.className = 'branch-container';
        
        // Branch name header
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

function updateFileStatusDisplay() {
    // Update modified files
    const modifiedDiv = document.getElementById('modified-files');
    modifiedDiv.innerHTML = '';
    modifiedDiv.className = 'status-files';
    gitState.modifiedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'status-file';
        fileDiv.textContent = file;
        modifiedDiv.appendChild(fileDiv);
    });
    
    // Update staged files
    const stagedDiv = document.getElementById('staged-files');
    stagedDiv.innerHTML = '';
    stagedDiv.className = 'status-files';
    gitState.stagedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'status-file';
        fileDiv.textContent = file;
        stagedDiv.appendChild(fileDiv);
    });
    
    // Update committed files
    const committedDiv = document.getElementById('committed-files');
    committedDiv.innerHTML = '';
    committedDiv.className = 'status-files';
    gitState.committedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'status-file';
        fileDiv.textContent = file;
        committedDiv.appendChild(fileDiv);
    });
}

// File system functions
function updateFileDisplay() {
    const filesDiv = document.getElementById('files');
    filesDiv.innerHTML = '';
    
    gitState.workingDirectory.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file';
        fileDiv.textContent = file;
        fileDiv.onclick = () => modifyFile(file);
        
        if (gitState.modifiedFiles.includes(file)) {
            fileDiv.classList.add('modified');
        } else if (gitState.stagedFiles.includes(file)) {
            fileDiv.classList.add('staged');
        }
        
        filesDiv.appendChild(fileDiv);
    });
    
    // Add new file button
    const addButton = document.createElement('button');
    addButton.textContent = '+ Add File';
    addButton.onclick = addFile;
    filesDiv.appendChild(addButton);
    
    // Update status display
    updateFileStatusDisplay();
}

function addFile() {
    const fileName = prompt('Enter file name:');
    if (fileName && !gitState.workingDirectory.includes(fileName)) {
        gitState.workingDirectory.push(fileName);
        gitState.modifiedFiles.push(fileName);
        updateFileDisplay();
        addToTerminal('touch ' + fileName, `Created ${fileName}`, 'success');
    }
}

function modifyFile(fileName) {
    if (!gitState.modifiedFiles.includes(fileName) && !gitState.stagedFiles.includes(fileName)) {
        gitState.modifiedFiles.push(fileName);
        
        // Store original state if not already stored
        if (!gitState.originalFiles[fileName]) {
            gitState.originalFiles[fileName] = 'original state';
        }
        
        updateFileDisplay();
        addToTerminal('nano ' + fileName, `Modified ${fileName}`, 'output');
    }
}

// Initialize display
updateFileDisplay();
updateGitGraph();
updateBranchDisplay();
