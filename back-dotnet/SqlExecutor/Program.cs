using System;
using System.Data.SqlClient;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        string connectionString = "Server=localhost;Database=CompanyManager;User Id=sa;Password=StrongPassword123!;";
        string sqlScript = File.ReadAllText("add_departments_table.sql");

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            using (SqlCommand command = new SqlCommand(sqlScript, connection))
            {
                try 
                {
                    command.ExecuteNonQuery();
                    Console.WriteLine("SQL script executed successfully.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error executing SQL script: {ex.Message}");
                }
            }
        }
    }
}