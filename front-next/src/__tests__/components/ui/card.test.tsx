import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
  // Teste básico de renderização
  it('renders a basic card correctly', () => {
    render(<Card data-testid="test-card">Card Content</Card>);
    const card = screen.getByTestId('test-card');
    
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Content');
    expect(card).toHaveClass('rounded-4xl');
  });

  // Teste de variantes
  it('applies the correct variant classes', () => {
    const { rerender } = render(<Card data-testid="test-card" variant="glass">Glass Card</Card>);
    let card = screen.getByTestId('test-card');
    expect(card).toHaveClass('glass-container');
    
    rerender(<Card data-testid="test-card" variant="dark">Dark Card</Card>);
    card = screen.getByTestId('test-card');
    expect(card).toHaveClass('dark-card');
    
    rerender(<Card data-testid="test-card" variant="feature">Feature Card</Card>);
    card = screen.getByTestId('test-card');
    expect(card).toHaveClass('feature-card');
    
    rerender(<Card data-testid="test-card" variant="primary">Primary Card</Card>);
    card = screen.getByTestId('test-card');
    expect(card).toHaveClass('bg-gradient-primary');
    
    rerender(<Card data-testid="test-card" variant="accent">Accent Card</Card>);
    card = screen.getByTestId('test-card');
    expect(card).toHaveClass('bg-gradient-accent');
  });

  // Teste de composição de componentes
  it('composes card components correctly', () => {
    render(
      <Card data-testid="test-card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">Card Content</CardContent>
        <CardFooter data-testid="card-footer">Card Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('card-description')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Card Title');
    expect(screen.getByTestId('card-description')).toHaveTextContent('Card Description');
    expect(screen.getByTestId('card-content')).toHaveTextContent('Card Content');
    expect(screen.getByTestId('card-footer')).toHaveTextContent('Card Footer');
  });

  // Teste de propriedades adicionais
  it('applies additional className correctly', () => {
    render(<Card data-testid="test-card" className="custom-class">Card Content</Card>);
    const card = screen.getByTestId('test-card');
    
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-4xl'); // Ainda mantém as classes padrão
  });

  // Teste de animação
  it('applies animation variant correctly', () => {
    render(<Card data-testid="test-card" animation="float">Floating Card</Card>);
    const card = screen.getByTestId('test-card');
    
    expect(card).toHaveClass('animate-float');
  });

  // Teste de acessibilidade para sub-componentes
  it('renders CardHeader with appropriate spacing classes', () => {
    render(<CardHeader data-testid="header">Header Content</CardHeader>);
    const header = screen.getByTestId('header');
    
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
  });

  it('renders CardTitle with appropriate typography classes', () => {
    render(<CardTitle data-testid="title">Title Text</CardTitle>);
    const title = screen.getByTestId('title');
    
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-medium');
  });
});