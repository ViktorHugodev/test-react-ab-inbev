using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyManager.Application.DTOs
{
    public class DepartmentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateDepartmentDto
    {
        [Required(ErrorMessage = "O nome do departamento é obrigatório.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 50 caracteres.")]
        public string Name { get; set; }

        [StringLength(200, ErrorMessage = "A descrição não pode exceder 200 caracteres.")]
        public string Description { get; set; }
    }

    public class UpdateDepartmentDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome do departamento é obrigatório.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 50 caracteres.")]
        public string Name { get; set; }

        [StringLength(200, ErrorMessage = "A descrição não pode exceder 200 caracteres.")]
        public string Description { get; set; }
    }
}