import { http, HttpResponse } from 'msw';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5244/api';


const mockEmployee = {
  id: "123",
  firstName: "Usuário",
  lastName: "Teste",
  fullName: "Usuário Teste",
  email: "test@example.com",
  documentNumber: "12345678900",
  birthDate: new Date("1990-01-01").toISOString(),
  age: 33,
  role: 2, 
  department: "TI",
  phoneNumbers: [
    { id: "1", number: "11999999999", type: 1 }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};


const mockAuthResponse = {
  token: "mock-jwt-token",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  employee: mockEmployee
};


const mockCurrentUser = {
  id: "123",
  email: "test@example.com",
  name: "Usuário Teste",
  role: "Leader"
};


export const handlers = [
  
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json(mockAuthResponse);
    }
    
    return new HttpResponse(
      JSON.stringify({ message: "Email ou senha inválidos" }), 
      { status: 401 }
    );
  }),
  
  http.get(`${API_URL}/Auth/me`, () => {
    return HttpResponse.json(mockCurrentUser);
  }),
  
  
  http.get(`${API_URL}/Employees`, () => {
    return HttpResponse.json([mockEmployee]);
  }),
  
  http.get(`${API_URL}/Employees/paged`, () => {
    return HttpResponse.json({
      items: [mockEmployee],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    });
  }),
  
  http.get(`${API_URL}/Employees/:id`, ({ params }) => {
    const { id } = params as { id: string };
    if (id === "123") {
      return HttpResponse.json(mockEmployee);
    }
    return new HttpResponse(null, { status: 404 });
  }),
  
  http.post(`${API_URL}/Employees`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    return HttpResponse.json({
      ...mockEmployee,
      ...body,
      id: "456"
    });
  }),
  
  http.put(`${API_URL}/Employees/:id`, async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = await request.json() as Record<string, any>;
    
    if (id === "123") {
      return HttpResponse.json({
        ...mockEmployee,
        ...body
      });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),
  
  http.delete(`${API_URL}/Employees/:id`, ({ params }) => {
    const { id } = params as { id: string };
    
    if (id === "123") {
      return new HttpResponse(null, { status: 204 });
    }
    
    return new HttpResponse(null, { status: 404 });
  }),
  
  
  http.get(`${API_URL}/Departments`, () => {
    return HttpResponse.json([
      { id: "1", name: "TI", description: "Tecnologia da Informação" },
      { id: "2", name: "RH", description: "Recursos Humanos" }
    ]);
  }),
  
  http.get(`${API_URL}/Departments/:id`, ({ params }) => {
    const { id } = params as { id: string };
    
    if (id === "1") {
      return HttpResponse.json({ id: "1", name: "TI", description: "Tecnologia da Informação" });
    }
    
    return new HttpResponse(null, { status: 404 });
  })
];
