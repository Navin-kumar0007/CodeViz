/**
 * AWS Cloud Basics - Learning Path
 * The core AWS services every developer should know.
 */

export const AWS_PATH = {
    id: 'aws-basics',
    title: 'AWS Cloud Basics',
    icon: '☁️',
    category: 'Cloud & DevOps',
    description: 'Get started with AWS — compute (EC2/Lambda), storage (S3), and the shared responsibility model.',
    prerequisites: [],
    lessons: [
        {
            id: 'cloud-fundamentals',
            title: 'Cloud & the Shared Responsibility Model',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'The **cloud** rents computing on demand — you pay for what you use instead of buying hardware. AWS is the largest provider.' },
                { type: 'text', content: 'The **Shared Responsibility Model**: AWS secures the cloud (hardware, network, facilities); **you** secure what you put *in* the cloud (data, access, configuration).' },
                { type: 'text', content: 'Resources live in **Regions** (geographic areas) split into **Availability Zones** (isolated data centers) for fault tolerance.' },
                { type: 'warning', content: 'Most breaches are customer misconfigurations (e.g. public S3 buckets), not AWS failures. Lock down access.' },
            ],
            keyConcepts: [
                'Cloud = on-demand, pay-as-you-go computing',
                'AWS secures the cloud; you secure what is in it',
                'Regions contain multiple Availability Zones',
                'Spread across AZs for high availability',
            ],
            code: {
                bash: `# The AWS CLI talks to services
aws configure                 # set credentials + region
aws sts get-caller-identity   # who am I?
aws ec2 describe-regions --output table`,
            },
            quiz: [
                {
                    question: 'Under the Shared Responsibility Model, who secures your data and access config?',
                    options: ['AWS', 'You, the customer', 'Nobody', 'The internet provider'],
                    correct: 1,
                    explanation: 'AWS secures the infrastructure; the customer secures their data, access, and configuration.',
                },
                {
                    question: 'What is an Availability Zone?',
                    options: ['A billing plan', 'An isolated data center within a Region', 'A type of database', 'A CLI command'],
                    correct: 1,
                    explanation: 'AZs are isolated data centers within a Region; using multiple AZs improves fault tolerance.',
                },
            ],
        },
        {
            id: 'compute-ec2-lambda',
            title: 'Compute: EC2 & Lambda',
            duration: '8 min',
            explanation: [
                { type: 'text', content: '**EC2** gives you virtual servers you manage — full control, but you handle scaling and patching.' },
                { type: 'text', content: '**Lambda** is **serverless**: you upload a function and AWS runs it on demand, scaling automatically. You pay per invocation, nothing when idle.' },
                { type: 'tip', content: 'Use Lambda for event-driven, spiky workloads; EC2 (or containers) for long-running or stateful services.' },
            ],
            keyConcepts: [
                'EC2 = managed virtual servers (full control)',
                'Lambda = serverless functions, auto-scaled',
                'Lambda bills per invocation, zero when idle',
                'Pick compute by workload shape',
            ],
            code: {
                python: `# An AWS Lambda handler (Python)
def handler(event, context):
    name = event.get("name", "world")
    return {
        "statusCode": 200,
        "body": f"Hello, {name}!"
    }`,
            },
            quiz: [
                {
                    question: 'What defines AWS Lambda?',
                    options: ['A managed database', 'Serverless functions that scale automatically', 'A virtual server you patch', 'A CDN'],
                    correct: 1,
                    explanation: 'Lambda runs your function on demand and scales automatically — no servers to manage.',
                },
                {
                    question: 'When is Lambda a great fit?',
                    options: ['Long-running stateful apps', 'Event-driven, spiky workloads', 'When you need OS control', 'Never'],
                    correct: 1,
                    explanation: 'Lambda shines for event-driven, bursty workloads and scales to zero when idle.',
                },
            ],
        },
        {
            id: 'storage-s3',
            title: 'Storage: S3',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**S3** (Simple Storage Service) stores **objects** (files) in **buckets**. It is durable, virtually unlimited, and accessed over HTTP.' },
                { type: 'text', content: 'Great for static assets, backups, uploads, and data lakes. **Storage classes** (Standard, Infrequent Access, Glacier) trade cost for retrieval speed.' },
                { type: 'warning', content: 'Buckets are private by default — keep them that way. A public bucket is a classic data-leak source.' },
            ],
            keyConcepts: [
                'S3 stores objects in buckets, accessed over HTTP',
                'Durable and effectively unlimited',
                'Storage classes trade cost vs retrieval speed',
                'Keep buckets private unless truly public',
            ],
            code: {
                bash: `# Create a bucket and upload a file
aws s3 mb s3://my-app-uploads
aws s3 cp report.pdf s3://my-app-uploads/reports/

# List objects
aws s3 ls s3://my-app-uploads/reports/`,
            },
            quiz: [
                {
                    question: 'What does S3 store?',
                    options: ['Virtual machines', 'Objects (files) in buckets', 'SQL tables', 'Container images only'],
                    correct: 1,
                    explanation: 'S3 is object storage: files live as objects inside buckets.',
                },
                {
                    question: 'What is the safe default for an S3 bucket?',
                    options: ['Public to everyone', 'Private', 'Deleted', 'Read-only to the world'],
                    correct: 1,
                    explanation: 'Buckets are private by default; making them public is a common cause of data leaks.',
                },
            ],
        },
    ],
};
