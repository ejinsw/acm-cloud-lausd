import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const reqData = await req.json();
    try {
        const response = await fetch('http://localhost:8080/students/createStudent', {
            // Optional: forward some headers, add auth tokens, etc.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //Authorization: `Bearer ${process.env.API_KEY}`,
            },
            body: JSON.stringify(reqData),

        });

        
        
        if(response.status == 400)
        {
            return new Response(JSON.stringify("Account created"), {status: 400});
        }
        
        return new Response(JSON.stringify("Account could not be created"), {status: 500});

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'API call failed' }), { status: 500 });
    }
}

