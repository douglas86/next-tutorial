export const spec = `
openapi: 3.0.3
info:
    title: Next.js API
    version: '1.0.0'
tags:
    - name: Hello
      description: Endpoint related to greetings
    - name: Seed
      description: Endpoint for seeding data
paths:
   /api/hello:
        get:
            summary: Returns hello world
            tags:
                - Hello
            responses:
                '200':
                    description: OK
   /api/seed/users:
        post:
            summary: Returns users data
            tags:
                - Seed
            responses:
                '200':
                    description: OK
`;
