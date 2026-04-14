/**
 * Task Manager Backend - API Test Script
 * 
 * Run with: node test/api-test.js
 * 
 * Prerequisites:
 * - Server must be running on http://localhost:3001
 */

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'default-api-key-change-me';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logPass(message) {
  log(`✅ ${message}`, 'green');
  passed++;
}

function logFail(message, error) {
  log(`❌ ${message}`, 'red');
  if (error) {
    log(`   Error: ${error}`, 'red');
  }
  failed++;
}

async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return {
      status: response.status,
      data
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test functions
async function testHealth() {
  log('\n📋 Test 1: Health Check', 'cyan');
  try {
    const result = await request('GET', '/api/health');
    
    if (result.status === 200 && result.data.status === 'ok') {
      logPass('Health check passed');
      log(`   Version: ${result.data.version}`, 'blue');
      log(`   WebSocket connections: ${result.data.websocketConnections}`, 'blue');
    } else {
      logFail('Health check failed', `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    logFail('Health check failed', error.message);
  }
}

async function testGetConfig() {
  log('\n📋 Test 2: Get Configuration', 'cyan');
  try {
    const result = await request('GET', '/api/v1/config');
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Get config passed');
      log(`   Version: ${result.data.data.version}`, 'blue');
      log(`   Features: ${JSON.stringify(result.data.data.features)}`, 'blue');
    } else {
      logFail('Get config failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Get config failed', error.message);
  }
}

async function testCreateAgent() {
  log('\n📋 Test 3: Create Agent', 'cyan');
  try {
    const agentData = {
      name: 'Test Agent Alpha',
      type: 'developer',
      description: 'A test agent for API testing',
      capabilities: ['frontend', 'backend', 'testing'],
      config: {
        heartbeatInterval: 30,
        maxConcurrentTasks: 5,
        autoAcceptTasks: true,
        notificationChannels: ['ws']
      }
    };

    const result = await request('POST', '/api/v1/agents', agentData);
    
    if (result.status === 201 && result.data.success === true) {
      logPass('Create agent passed');
      log(`   Agent ID: ${result.data.data.id}`, 'blue');
      log(`   Name: ${result.data.data.name}`, 'blue');
      return result.data.data.id;
    } else {
      logFail('Create agent failed', `Status: ${result.status}`);
      return null;
    }
  } catch (error) {
    logFail('Create agent failed', error.message);
    return null;
  }
}

async function testGetAgents() {
  log('\n📋 Test 4: Get Agents List', 'cyan');
  try {
    const result = await request('GET', '/api/v1/agents');
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Get agents passed');
      log(`   Total agents: ${result.data.data.length}`, 'blue');
    } else {
      logFail('Get agents failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Get agents failed', error.message);
  }
}

async function testGetAgent(agentId) {
  log('\n📋 Test 5: Get Agent by ID', 'cyan');
  try {
    const result = await request('GET', `/api/v1/agents/${agentId}`);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Get agent by ID passed');
      log(`   Name: ${result.data.data.name}`, 'blue');
      log(`   Type: ${result.data.data.type}`, 'blue');
    } else {
      logFail('Get agent by ID failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Get agent by ID failed', error.message);
  }
}

async function testCreateTask() {
  log('\n📋 Test 6: Create Task', 'cyan');
  try {
    const taskData = {
      title: 'Test Task - API Testing',
      description: 'This is a test task created by API test script',
      priority: 'high',
      tags: ['test', 'api'],
      status: 'todo',
      metadata: {
        storyPoints: 3,
        epicId: 'test-epic'
      }
    };

    const result = await request('POST', '/api/v1/tasks', taskData);
    
    if (result.status === 201 && result.data.success === true) {
      logPass('Create task passed');
      log(`   Task ID: ${result.data.data.id}`, 'blue');
      log(`   Title: ${result.data.data.title}`, 'blue');
      log(`   Status: ${result.data.data.status}`, 'blue');
      return result.data.data.id;
    } else {
      logFail('Create task failed', `Status: ${result.status}`);
      return null;
    }
  } catch (error) {
    logFail('Create task failed', error.message);
    return null;
  }
}

async function testGetTasks() {
  log('\n📋 Test 7: Get Tasks List', 'cyan');
  try {
    const result = await request('GET', '/api/v1/tasks');
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Get tasks passed');
      log(`   Total tasks: ${result.data.data.pagination.total}`, 'blue');
      log(`   Tasks returned: ${result.data.data.tasks.length}`, 'blue');
    } else {
      logFail('Get tasks failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Get tasks failed', error.message);
  }
}

async function testGetTask(taskId) {
  log('\n📋 Test 8: Get Task by ID', 'cyan');
  try {
    const result = await request('GET', `/api/v1/tasks/${taskId}`);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Get task by ID passed');
      log(`   Title: ${result.data.data.title}`, 'blue');
      log(`   Status: ${result.data.data.status}`, 'blue');
    } else {
      logFail('Get task by ID failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Get task by ID failed', error.message);
  }
}

async function testUpdateTask(taskId) {
  log('\n📋 Test 9: Update Task', 'cyan');
  try {
    const updates = {
      title: 'Test Task - Updated',
      priority: 'urgent'
    };

    const result = await request('PATCH', `/api/v1/tasks/${taskId}`, updates);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Update task passed');
      log(`   New title: ${result.data.data.title}`, 'blue');
      log(`   New priority: ${result.data.data.priority}`, 'blue');
    } else {
      logFail('Update task failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Update task failed', error.message);
  }
}

async function testAssignTask(taskId, agentId) {
  log('\n📋 Test 10: Assign Task to Agent', 'cyan');
  try {
    const assignData = {
      assigneeId: agentId
    };

    const result = await request('POST', `/api/v1/tasks/${taskId}/assign`, assignData);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Assign task passed');
      log(`   Task: ${result.data.data.taskId}`, 'blue');
      log(`   Assigned to: ${result.data.data.assigneeId}`, 'blue');
    } else {
      logFail('Assign task failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Assign task failed', error.message);
  }
}

async function testMoveTask(taskId) {
  log('\n📋 Test 11: Move Task (Kanban)', 'cyan');
  try {
    const moveData = {
      toColumn: 'in_progress',
      position: 1
    };

    const result = await request('POST', `/api/v1/tasks/${taskId}/move`, moveData);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Move task passed');
      log(`   New column: ${result.data.data.toColumn}`, 'blue');
      log(`   New status: ${result.data.data.status}`, 'blue');
    } else {
      logFail('Move task failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Move task failed', error.message);
  }
}

async function testCreateTemplate() {
  log('\n📋 Test 12: Create Template', 'cyan');
  try {
    const templateData = {
      name: 'Test Template',
      description: 'A test template for development',
      stages: [
        { id: 'stage-1', name: 'Design', order: 1, status: 'todo', estimatedTime: 60 },
        { id: 'stage-2', name: 'Develop', order: 2, status: 'todo', estimatedTime: 120 },
        { id: 'stage-3', name: 'Test', order: 3, status: 'todo', estimatedTime: 30 }
      ],
      tags: ['test', 'development'],
      defaultPriority: 'medium'
    };

    const result = await request('POST', '/api/v1/templates', templateData);
    
    if (result.status === 201 && result.data.success === true) {
      logPass('Create template passed');
      log(`   Template ID: ${result.data.data.id}`, 'blue');
      log(`   Name: ${result.data.data.name}`, 'blue');
      log(`   Stages: ${result.data.data.stages.length}`, 'blue');
    } else {
      logFail('Create template failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Create template failed', error.message);
  }
}

async function testGetTemplates() {
  log('\n📋 Test 13: Get Templates List', 'cyan');
  try {
    const result = await request('GET', '/api/v1/templates');
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Get templates passed');
      log(`   Total templates: ${result.data.data.length}`, 'blue');
    } else {
      logFail('Get templates failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Get templates failed', error.message);
  }
}

async function testHeartbeat() {
  log('\n📋 Test 14: Agent Heartbeat', 'cyan');
  try {
    const heartbeatData = {
      agentId: 'agent-test-1',
      status: 'online',
      currentTasks: []
    };

    const result = await request('POST', '/api/v1/heartbeat', heartbeatData);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Heartbeat passed');
      log(`   Agent ID: ${result.data.data.agentId}`, 'blue');
      log(`   Pending tasks: ${result.data.data.pendingTasks.length}`, 'blue');
      log(`   Server time: ${result.data.data.serverTime}`, 'blue');
    } else {
      logFail('Heartbeat failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Heartbeat failed', error.message);
  }
}

async function testDeleteTask(taskId) {
  log('\n📋 Test 15: Delete Task', 'cyan');
  try {
    const result = await request('DELETE', `/api/v1/tasks/${taskId}`);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Delete task passed');
      log(`   Deleted task: ${result.data.data.taskId}`, 'blue');
    } else {
      logFail('Delete task failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Delete task failed', error.message);
  }
}

async function testDeleteAgent(agentId) {
  log('\n📋 Test 16: Delete Agent', 'cyan');
  try {
    const result = await request('DELETE', `/api/v1/agents/${agentId}`);
    
    if (result.status === 200 && result.data.success === true) {
      logPass('Delete agent passed');
      log(`   Deleted agent: ${result.data.data.agentId}`, 'blue');
    } else {
      logFail('Delete agent failed', `Status: ${result.status}`);
    }
  } catch (error) {
    logFail('Delete agent failed', error.message);
  }
}

async function runTests() {
  log('\n' + '='.repeat(50), 'cyan');
  log('Task Manager Backend - API Test Suite', 'cyan');
  log('='.repeat(50), 'cyan');

  // Check if server is running
  try {
    await testHealth();
  } catch (error) {
    log('\n❌ Server is not running! Please start the server first.', 'red');
    log('   Run: npm start', 'yellow');
    process.exit(1);
  }

  // Configuration tests
  await testGetConfig();

  // Agent tests
  const agentId = await testCreateAgent();
  await testGetAgents();
  if (agentId) await testGetAgent(agentId);

  // Task tests
  const taskId = await testCreateTask();
  await testGetTasks();
  if (taskId) {
    await testGetTask(taskId);
    await testUpdateTask(taskId);
    if (agentId) await testAssignTask(taskId, agentId);
    await testMoveTask(taskId);
  }

  // Template tests
  await testCreateTemplate();
  await testGetTemplates();

  // Heartbeat test
  await testHeartbeat();

  // Cleanup
  if (taskId) await testDeleteTask(taskId);
  if (agentId) await testDeleteAgent(agentId);

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('Test Summary', 'cyan');
  log('='.repeat(50), 'cyan');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`📊 Total: ${passed + failed}`, 'blue');
  
  log('\n', 'reset');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
