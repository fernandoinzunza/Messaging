using Microsoft.EntityFrameworkCore.Migrations;

namespace Messaging.Migrations
{
    public partial class Conectados : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Conectados",
                columns: table => new
                {
                    Telefono = table.Column<string>(nullable: false),
                    IdConexion = table.Column<string>(nullable: false),
                    UltimaConexion = table.Column<string>(nullable : false),
                    ConectadoState = table.Column<int>(nullable : false)
                }
                );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Conectados");
        }
    }
}
