FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY out/ .
ENV ASPNETCORE_URLS=http://+:8082
EXPOSE 8082 50051
ENTRYPOINT ["dotnet","Vehiculos.dll"]
