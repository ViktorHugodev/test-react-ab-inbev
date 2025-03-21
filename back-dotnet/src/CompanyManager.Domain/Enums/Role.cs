namespace CompanyManager.Domain.Enums
{
    public enum Role
    {
        Employee = 1, // Funcionário comum (permissões básicas)
        Leader = 2,   // Líder (permissões intermediárias)
        Director = 3  // Diretor (permissões completas)
    }
}