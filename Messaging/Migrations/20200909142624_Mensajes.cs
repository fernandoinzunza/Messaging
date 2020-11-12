using Microsoft.EntityFrameworkCore.Migrations;

namespace Messaging.Migrations
{
    public partial class Mensajes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mensajes",
                columns: table => new
                {
                    Emisor = table.Column<string>(nullable: false),
                    Receptor = table.Column<string>(nullable: false),
                    FechaEnviado = table.Column<string>(nullable:false),
                    Hora = table.Column<string>(nullable: false),
                    Contenido = table.Column<string>(nullable: false),
                    Estado = table.Column<string>(nullable: false)
                }
                );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mensajes");
        }
    }
}
