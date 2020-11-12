using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Messaging.Models
{
    public partial class chatwebContext : DbContext
    {
        public chatwebContext()
        {
        }

        public chatwebContext(DbContextOptions<chatwebContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Personas> Personas { get; set; }
        public virtual DbSet<Conectado> Conectados { get; set; }
        public virtual DbSet<Mensaje> Mensajes { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=.;Database=chatweb;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Personas>(entity =>
            {
                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(128);

                entity.Property(e => e.FirstName).HasMaxLength(50);

                entity.Property(e => e.Surname).HasColumnName("Surname");

                entity.Property(e => e.Pass).HasMaxLength(30);

                entity.Property(e => e.Phone)
                    .IsRequired()
                    .HasMaxLength(10)
                    .IsUnicode(false)
                    .IsFixedLength();
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
