FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar os arquivos .csproj e restaurar as dependências
COPY ["src/CompanyManager.API/CompanyManager.API.csproj", "src/CompanyManager.API/"]
COPY ["src/CompanyManager.Application/CompanyManager.Application.csproj", "src/CompanyManager.Application/"]
COPY ["src/CompanyManager.Domain/CompanyManager.Domain.csproj", "src/CompanyManager.Domain/"]
COPY ["src/CompanyManager.Infrastructure/CompanyManager.Infrastructure.csproj", "src/CompanyManager.Infrastructure/"]

RUN dotnet restore "src/CompanyManager.API/CompanyManager.API.csproj"

# Copiar o restante dos arquivos e realizar o build
COPY . .
WORKDIR "/src/src/CompanyManager.API"
RUN dotnet build "CompanyManager.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CompanyManager.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CompanyManager.API.dll"]