async function testAutograder() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5001/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'instructor@codeviz.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        // 2. Get a classroom
        const classRes = await fetch('http://localhost:5001/api/campus/classrooms', { headers });
        const classData = await classRes.json();
        const classroomId = classData[0]._id;
        console.log('Classroom ID:', classroomId);

        // 3. Create assignment
        const assignRes = await fetch(`http://localhost:5001/api/campus/classrooms/${classroomId}/assignments`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: "Auto Grader Test",
                description: "Print hello",
                starterCode: "print('')",
                expectedOutput: "hello",
                language: "python",
                maxPoints: 100,
                isPublished: true
            })
        });
        const assignData = await assignRes.json();
        const assignmentId = assignData._id;
        console.log('Created Assignment:', assignmentId);

        // 4. Submit correct code
        const submitRes1 = await fetch(`http://localhost:5001/api/autograder/${assignmentId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ code: "print('hello')" })
        });
        const submitData1 = await submitRes1.json();
        console.log('Correct Submit Result:', submitData1);

        // 5. Submit incorrect code
        const submitRes2 = await fetch(`http://localhost:5001/api/autograder/${assignmentId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ code: "print('wrong')" })
        });
        const submitData2 = await submitRes2.json();
        console.log('Incorrect Submit Result:', submitData2);

    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

testAutograder();
