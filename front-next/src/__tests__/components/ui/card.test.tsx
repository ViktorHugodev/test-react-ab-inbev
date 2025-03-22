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
    expect(card).toHaveClass('bg-solid-2');
    
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
});
