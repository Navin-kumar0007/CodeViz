/**
 * Kubernetes Essentials - Learning Path
 * Introduction to container orchestration at scale.
 */

export const K8S_BASICS_PATH = {
    id: 'k8s-basics',
    title: 'Kubernetes Essentials',
    icon: '☸️',
    category: 'Cloud & DevOps',
    description: 'Step into the world of orchestration. Learn about Pods, Deployments, and Self-healing systems.',
    prerequisites: ['docker-compose'],
    lessons: [
        {
            id: 'what-is-k8s',
            title: 'The Orchestrator',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'If Docker is a single shipping container, **Kubernetes (K8s)** is the captain of the massive cargo ship. It automates the deployment, scaling, and management of containerized applications.'
                },
                {
                    type: 'text',
                    content: 'Key feature: **Desired State**. You tell K8s "I want 3 copies of my app," and it works tirelessly to ensure 3 copies are always running, even if one crashes.'
                }
            ],
            keyConcepts: [
                'Control Plane',
                'Worker Nodes',
                'Kubelet',
                'API Server'
            ],
            code: {
                bash: `# Check cluster status
kubectl cluster-info

# Get all running pods
kubectl get pods`
            },
            quiz: [
                {
                    question: 'What is the "Desired State" in Kubernetes?',
                    options: [
                         'The speed of the network',
                         'The configuration you want K8s to maintain',
                         'The current state of the database',
                         'The geographical location of the servers'
                    ],
                    correct: 1,
                    explanation: 'Kubernetes continuously compares the actual state of the cluster with your desired state and makes changes to align them.'
                }
            ]
        },
        {
            id: 'pods-deployments',
            title: 'Pods & Deployments',
            duration: '20 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Pod** is the smallest unit in K8s. It can hold one or more containers. However, you rarely create Pods directly. Instead, you use a **Deployment**.'
                },
                {
                    type: 'text',
                    content: 'A Deployment manages a **ReplicaSet**, which ensures the correct number of pods are running at all times.'
                }
            ],
            keyConcepts: [
                'Pods',
                'Deployments',
                'Replicas',
                'Selectors & Labels'
            ],
            code: {
                yaml: `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web-container
        image: nginx:latest`
            },
            quiz: [
                {
                    question: 'What is the smallest deployable unit in Kubernetes?',
                    options: ['Container', 'Pod', 'Node', 'Deployment'],
                    correct: 1,
                    explanation: 'A Pod is the basic building block. Containers always run inside Pods in Kubernetes.'
                }
            ]
        }
    ]
};
