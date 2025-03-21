using System;

namespace CompanyManager.Domain.Interfaces
{
    /// <summary>
    /// Interface for entities that track creation and update timestamps
    /// </summary>
    public interface IHasTimestamps
    {
        DateTime CreatedAt { get; }
        DateTime? UpdatedAt { get; }
        
        void SetCreatedAt(DateTime dateTime);
        void SetUpdatedAt(DateTime? dateTime);
    }
}
