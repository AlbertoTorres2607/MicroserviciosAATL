FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY out/ .
ENV ASPNETCORE_URLS=http://+:8083
EXPOSE 8083
ENTRYPOINT ["dotnet","Envios.dll"]
