FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Tobic.Api.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
# Npgsql probes GSSAPI on connect; without this library the runtime can crash.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app ./
# Uploaded files live in a volume or mounted disk; the image only ships the migrated
# legacy images. Runs as root because hosted disks (e.g. Render) mount root-owned.
EXPOSE 8080
ENTRYPOINT ["dotnet", "Tobic.Api.dll"]
