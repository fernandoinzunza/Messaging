using Microsoft.EntityFrameworkCore.Migrations;

namespace Messaging.Migrations
{
    public partial class PeopleTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
            name: "Nvarchar(50)",
            table: "Personas",
            newName: "Surname");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Personas");
        }
    }
}
