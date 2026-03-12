const fs = require('fs');
const acorn = require('acorn');
const astring = require('astring');

// 1. Get User Code
const userFile = process.argv[2];
if (!userFile) process.exit(1);
const code = fs.readFileSync(userFile, 'utf8');

// 2. Find ALL Variable Names
const declaredVars = new Set();
try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    const simpleWalk = (node) => {
        if (!node) return;
        if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
            declaredVars.add(node.id.name);
        }
        if (node.type === 'ForStatement' && node.init && node.init.type === 'VariableDeclaration') {
            node.init.declarations.forEach(d => {
                if (d.id.type === 'Identifier') declaredVars.add(d.id.name);
            });
        }
        for (const key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) node[key].forEach(simpleWalk);
                else simpleWalk(node[key]);
            }
        }
    };
    simpleWalk(ast);
} catch (e) { }

const varList = Array.from(declaredVars);

// 3. Safe Variable Capture
const snapshotString = `{` + varList.map(v =>
    `${v}: (() => { try { return ${v}; } catch(e) { return undefined; } })()`
).join(',') + `}`;

// 4. Tracer Library
const TRACER_LIB = `
const _trace = [];
const _start = Date.now();

function _recordStep(lineNum, state) {
    if (Date.now() - _start > 2000) return; 

    const frozenState = {};
    for (const key in state) {
        if (state[key] !== undefined) {
            try {
                frozenState[key] = JSON.parse(JSON.stringify(state[key]));
            } catch (e) {
                frozenState[key] = "[Complex Data]";
            }
        }
    }

    const step = {
        line: lineNum,
        variables: frozenState,
        stdout: ""
    };
    process.stdout.write(JSON.stringify(step) + '\\n');
}

// Trap console.log
const originalLog = console.log;
console.log = function(...args) {
    const output = args.join(" ") + "\\n";
    const logStep = {
        line: -1, // Log step
        variables: {},
        stdout: output
    };
    process.stdout.write(JSON.stringify(logStep) + '\\n');
};
`;

// 5. Inject Tracer
function injectTracer(ast) {
    const createRecordCall = (line) => {
        const src = `_recordStep(${line}, ${snapshotString})`;
        return acorn.parse(src, { ecmaVersion: 2020 }).body[0];
    };

    const walk = (node) => {
        if (!node) return;

        if (node.type === 'BlockStatement' || node.type === 'Program') {
            const newBody = [];
            node.body.forEach(stmt => {
                newBody.push(stmt);
                const lineNum = stmt.loc ? stmt.loc.start.line : 0;
                if (stmt.type !== 'VariableDeclaration') {
                    newBody.push(createRecordCall(lineNum));
                }
                walk(stmt);
            });
            node.body = newBody;
        }
        else if (['ForStatement', 'WhileStatement', 'DoWhileStatement'].includes(node.type)) {
            if (node.body.type !== 'BlockStatement') {
                node.body = { type: 'BlockStatement', body: [node.body] };
            }
            const lineNum = node.loc ? node.loc.start.line : 0;
            node.body.body.unshift(createRecordCall(lineNum));
            walk(node.body);
        }
        else {
            for (const key in node) {
                if (node[key] && typeof node[key] === 'object') {
                    if (Array.isArray(node[key])) node[key].forEach(walk);
                    else walk(node[key]);
                }
            }
        }
    };

    walk(ast);
}

// 6. Execute
try {
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
    injectTracer(ast);
    const instrumentedCode = astring.generate(ast);

    const finalScript = `
        const fs = require('fs');
        ${TRACER_LIB}
        try {
            ${instrumentedCode}
        } catch(e) {
            process.stdout.write(JSON.stringify({ error: e.message, line: 0 }) + '\\n');
        }
    `;

    eval(finalScript);

} catch (e) {
    console.log(JSON.stringify({ error: "Compilation/Parsing Error", line: 0 }));
}