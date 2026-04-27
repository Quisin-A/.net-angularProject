# FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
# WORKDIR /src
# COPY . .
# RUN dotnet restore
# RUN dotnet publish -c Release -o /app/publish

# FROM mcr.microsoft.com/dotnet/aspnet:9.0
# WORKDIR /app
# COPY --from=build /app/publish .
# EXPOSE 8080
# ENTRYPOINT ["dotnet", "MeetingRoomBookingApi.dll"]

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY . .

WORKDIR /app/backend/MeetingRoomBookingApi

RUN dotnet restore
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

COPY --from=build /out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "MeetingRoomBookingApi.dll"]