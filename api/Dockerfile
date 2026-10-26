FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Tobic.Api.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
# Uploaded files live in a volume or mounted disk; the image only ships the migrated
# legacy images. Runs as root because hosted disks (e.g. Render) mount root-owned.
EXPOSE 8080
ENTRYPOINT ["dotnet", "Tobic.Api.dll"]
