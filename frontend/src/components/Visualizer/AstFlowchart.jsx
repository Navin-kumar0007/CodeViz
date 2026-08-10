import React, { useEffect, useState, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import * as acorn from 'acorn';
import { motion } from 'framer-motion';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict', // sanitize labels derived from user code (no injected HTML/scripts)
  theme: 'base',
  look: 'handDrawn', // Phase 10: Sketchy/Whiteboard look
  themeVariables: {
    primaryColor: 'rgba(0, 245, 255, 0.1)',
    primaryTextColor: '#fff',
    primaryBorderColor: '#00f5ff',
    lineColor: '#8a2be2',
    secondaryColor: '#131313',
    tertiaryColor: '#1e1e2d',
    fontSize: '20px',
    fontFamily: 'var(--font-code)'
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    useMaxWidth: false
  }
});

// A small recursive AST to Mermaid graph syntax converter
const generateMermaidGraph = (ast) => {
    let graphDef = 'graph TD\n';
    let nodeId = 0;
    
    // Simple traverser. We don't need semantic perfection, just a cool visual
    const traverse = (node, parentId = null) => {
        if (!node) return;
        const currentId = `N${nodeId++}`;
        
        let label = node.type;
        let shape = `[${label}]`; // Default rectangle
        
        switch (node.type) {
            case 'IfStatement':
                label = 'IF Condition';
                shape = `{${label}}`; // Diamond
                break;
            case 'ForStatement':
            case 'WhileStatement':
                label = 'LOOP';
                shape = `(( ${label} ))`; // Circle/cylinder
                break;
            case 'FunctionDeclaration':
            case 'ArrowFunctionExpression':
                label = `Func: ${node.id ? node.id.name : 'anon'}`;
                shape = `[[${label}]]`; // Subroutine
                break;
            case 'VariableDeclaration':
                label = `Var Decl (${node.kind})`;
                break;
            case 'CallExpression':
                label = node.callee && node.callee.name ? `Call: ${node.callee.name}` : 'Call';
                break;
            case 'ReturnStatement':
                label = 'RETURN';
                shape = `>${label}]`; // Flag
                break;
            default:
                if (node.type.includes('Expression') || node.type === 'Identifier' || node.type === 'Literal') {
                    // Ignore overly granular expressions for flowchart clarity
                    // return null to prevent creating distinct nodes for every single character
                    return null; 
                }
        }
        
        // Add to graph string
        graphDef += `  ${currentId}${shape}\n`;
        
        if (parentId) {
            graphDef += `  ${parentId} --> ${currentId}\n`;
        }
        
        // Recursively traverse children
        const childrenKeys = ['body', 'consequent', 'alternate', 'declarations', 'init', 'test', 'update', 'expression'];
        childrenKeys.forEach(key => {
            if (node[key]) {
                if (Array.isArray(node[key])) {
                    let lastId = currentId;
                    node[key].forEach(child => {
                        const childId = traverse(child, lastId);
                        if (childId) lastId = childId; // Sequential logic blocks
                    });
                } else {
                    traverse(node[key], currentId);
                }
            }
        });
        
        return currentId;
    };
    
    if (ast.body && Array.isArray(ast.body)) {
        let lastId = null;
        ast.body.forEach(statement => {
            const returnedId = traverse(statement, lastId);
            if (returnedId) lastId = returnedId;
        });
    }
    
    return graphDef;
};

const AstFlowchart = ({ code }) => {
    const [svgContent, setSvgContent] = useState('');
    const containerRef = useRef(null);
    const chartId = React.useId().replace(/:/g, '');
    const chartIdRef = useRef(chartId);
    const syntaxError = useMemo(() => {
        if (!code || code.trim() === '') return false;
        try {
            acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
            return false;
        } catch {
            return true;
        }
    }, [code]);

    useEffect(() => {
        if (syntaxError || !code || code.trim() === '') {
            return;
        }
        
        try {
            const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
            const graphDef = generateMermaidGraph(ast);
            
            if (graphDef.trim() === 'graph TD') {
                return;
            }
            
            mermaid.render(chartIdRef.current, graphDef).then(({ svg }) => {
                setSvgContent(svg);
            }).catch(() => {
                // Mermaid rendering failed
            });
        } catch {
            // Should not happen given syntaxError check but safety catch
        }
    }, [code, syntaxError]);
    
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.icon}>🧠</span>
                <span style={styles.title}>AST Flowchart Synthesis</span>
                {syntaxError && <span style={styles.status}>[Syntax Incomplete]</span>}
            </div>
            
            <div style={styles.graphArea} ref={containerRef}>
                <style>{`
                    .mermaid-svg-container svg {
                        max-width: 100% !important;
                        height: auto !important;
                        min-width: 500px !important;
                    }
                `}</style>
                {(svgContent && code && code.trim() !== '') ? (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mermaid-svg-container"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                        dangerouslySetInnerHTML={{ __html: svgContent }} 
                     />
                ) : (
                    <div style={styles.empty}>
                        Type logic (if, loops, functions) to visualize architecture...
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-ghost)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '300px',
        overflow: 'hidden'
    },
    header: {
        background: 'var(--bg-muted)',
        padding: '10px 15px',
        borderBottom: '1px solid var(--border-ghost)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    title: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    icon: {
        fontSize: '14px'
    },
    status: {
        marginLeft: 'auto',
        fontSize: '10px',
        color: 'var(--accent-yellow)',
        fontFamily: 'var(--font-code)'
    },
    graphArea: {
        flex: 1,
        padding: '20px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--bg-terminal)',
        position: 'relative',
        // Force Mermaid SVG to be readable
        '& svg': {
            maxWidth: '100%',
            height: 'auto !important',
            minWidth: '400px'
        }
    },
    empty: {
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontFamily: 'var(--font-code)',
        fontStyle: 'italic',
        opacity: 0.5
    }
};

export default AstFlowchart;
