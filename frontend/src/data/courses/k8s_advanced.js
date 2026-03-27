/**
 * Advanced Kubernetes - Learning Path
 * Production-grade orchestration concepts.
 */

export const K8S_ADVANCED_PATH = {
    id: 'k8s-advanced',
    title: 'Advanced Orchestration',
    icon: '🚀',
    category: 'Cloud & DevOps',
    description: 'Master production-grade K8s: Networking, Services, Scaling, and Persistent Storage.',
    prerequisites: ['k8s-basics'],
    lessons: [
        {
            id: 'k8s-services',
            title: 'Services & Networking',
            duration: '18 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Pods are ephemeral—they die and get replaced with new IP addresses. A **Service** provides a stable entry point (IP + DNS) to access your Pods.'
                },
                {
                    type: 'text',
                    content: '**ClusterIP** is for internal communication, while **LoadBalancer** is used to expose your app to the internet.'
                }
            ],
            keyConcepts: [
                'ClusterIP',
                'NodePort',
                'LoadBalancer',
                'Service Discovery'
            ],
            code: {
                yaml: `# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-web-service
spec:
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer`
            },
            quiz: [
                {
                    question: 'Why do we need Services in Kubernetes?',
                    options: [
                        'To make Pods run faster',
                        'To provide a stable network endpoint for moving Pods',
                        'To store sensitive passwords',
                        'To auto-scale the cluster'
                    ],
                    correct: 1,
                    explanation: 'Services act as a reliable "front door" for your applications, routing traffic to the correct Pods regardless of their individual IP changes.'
                }
            ]
        },
        {
            id: 'k8s-configs-secrets',
            title: 'ConfigMaps & Secrets',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Never hardcode credentials! **ConfigMaps** are for non-sensitive configuration (like API URLs), while **Secrets** are for sensitive data (like DB passwords or API keys).'
                }
            ],
            keyConcepts: [
                'Environment Variables',
                'Volume Mounts',
                'Base64 Encoding',
                'Encryption at Rest'
            ],
            code: {
                yaml: `# secret.yaml (Conceptual)
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  password: cGFzc3dvcmQxMjM= # base64 encoded`
            },
            quiz: [
                {
                    question: 'What is the main difference between a ConfigMap and a Secret?',
                    options: [
                        'ConfigMaps are faster',
                        'Secrets are specifically for sensitive/encrypted data',
                        'Only ConfigMaps can be used as environment variables',
                        'There is no difference'
                    ],
                    correct: 1,
                    explanation: 'Secrets are designed to handle sensitive information with better security constraints than standard ConfigMaps.'
                }
            ]
        }
    ]
};
