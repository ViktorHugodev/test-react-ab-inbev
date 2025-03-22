using System;
using CompanyManager.Domain.Enums;
using CompanyManager.Domain.Exceptions;
using CompanyManager.Domain.ValueObjects;
using Xunit;
using FluentAssertions;

namespace CompanyManager.UnitTests.Domain.ValueObjects
{
    public class PhoneNumberTests
    {
        [Fact]
        public void Create_WithValidPhoneNumber_ShouldCreatePhoneNumber()
        {
            // Arrange
            var number = "123-456-7890";
            var type = PhoneType.Mobile;
            
            // Act
            var phoneNumber = PhoneNumber.Create(number, type);
            
            // Assert
            phoneNumber.Should().NotBeNull();
            phoneNumber.Number.Should().Be("1234567890"); // Normalized (digits only)
            phoneNumber.Type.Should().Be(type);
            phoneNumber.Id.Should().NotBe(Guid.Empty);
        }
        
        [Fact]
        public void Create_WithPhoneNumberContainingFormatting_ShouldNormalizeNumber()
        {
            // Arrange
            var numbers = new[] { 
                "(123) 456-7890", 
                "123.456.7890", 
                "123 456 7890", 
                "+1-123-456-7890" 
            };
            
            foreach (var number in numbers)
            {
                // Act
                var phoneNumber = PhoneNumber.Create(number, PhoneType.Mobile);
                
                // Assert
                phoneNumber.Number.Should().Be("1234567890"); // Should contain only digits
            }
        }
        
        [Theory]
        [InlineData("", "O número de telefone é obrigatório.")]
        [InlineData(" ", "O número de telefone é obrigatório.")]
        [InlineData(null, "O número de telefone é obrigatório.")]
        public void Create_WithEmptyPhoneNumber_ShouldThrowDomainException(
            string invalidNumber, string expectedErrorMessage)
        {
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => 
                PhoneNumber.Create(invalidNumber, PhoneType.Mobile));
            
            exception.Message.Should().Be(expectedErrorMessage);
        }
        
        [Theory]
        [InlineData("123")] // Too short
        [InlineData("abc")] // Non-numeric
        [InlineData("12a34")] // Mixed content that can't be normalized to valid number
        public void Create_WithInvalidPhoneNumber_ShouldThrowDomainException(string invalidNumber)
        {
            // Act & Assert
            var exception = Assert.Throws<DomainException>(() => 
                PhoneNumber.Create(invalidNumber, PhoneType.Mobile));
            
            exception.Message.Should().Be("O número de telefone informado não é válido.");
        }
        
        // Testes para diferentes tipos de telefone
        [Theory]
        [InlineData(PhoneType.Mobile)]
        [InlineData(PhoneType.Home)]
        [InlineData(PhoneType.Work)]
        [InlineData(PhoneType.Other)]
        public void Create_WithDifferentPhoneTypes_ShouldCreateWithCorrectType(PhoneType phoneType)
        {
            // Arrange
            var number = "1234567890";
            
            // Act
            var phoneNumber = PhoneNumber.Create(number, phoneType);
            
            // Assert
            phoneNumber.Type.Should().Be(phoneType);
        }
    }
}