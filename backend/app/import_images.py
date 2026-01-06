"""
Script to import existing images from img/ directory into the database.
"""
import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.carousel import CarouselSlide
from app.models.service import Service
from app.models.portfolio import PortfolioProject, ProjectStatus
from app.models.blog import BlogPost
from app.models.partner import Partner
from app.models.license import License
from app.config import settings

# Base directory paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
IMG_DIR = PROJECT_ROOT / "img"
UPLOAD_DIR = Path(settings.UPLOAD_DIR)


def copy_image_to_uploads(source_path: Path, subdirectory: str) -> str:
    """Copy image to uploads directory and return relative path."""
    upload_subdir = UPLOAD_DIR / subdirectory
    upload_subdir.mkdir(parents=True, exist_ok=True)
    
    dest_path = upload_subdir / source_path.name
    shutil.copy2(source_path, dest_path)
    
    return f"{subdirectory}/{source_path.name}"


def import_carousel_images(db: Session):
    """Import carousel images."""
    carousel_images = [
        ("carousel-1.jpg", "Biz bu işin peşəkarlarıyıq", "Xəyal etdiyiniz layihələr üçün", "Əlaqə", "https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0", 0),
        ("carousel-2.jpg", "Peşəkar ölçülər", "Xəyallarınızı gerçəyləşdiririk", "Əlaqə", "https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0", 1),
        ("flametowers2.jpg", "Bizə güvənə bilərsiz", "Nəticələrimiz göz qabagında", "Əlaqə", "https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0", 2),
        ("carousel-3.jpeg", "Bizə güvənə bilərsiz", "Nəticələrimiz göz qabagında", "Əlaqə", "https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0", 3),
        ("carousel-4.jpg", "Bizə güvənə bilərsiz", "Nəticələrimiz göz qabagında", "Əlaqə", "https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0", 4),
        ("carousel-5.jpg", "Bizə güvənə bilərsiz", "Nəticələrimiz göz qabagında", "Əlaqə", "https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0", 5),
    ]
    
    count = 0
    for img_name, title, subtitle, btn_text, btn_link, order in carousel_images:
        img_path = IMG_DIR / img_name
        if img_path.exists():
            # Check if already exists
            existing = db.query(CarouselSlide).filter(CarouselSlide.image_path.like(f"%{img_name}")).first()
            if existing:
                continue
            
            upload_path = copy_image_to_uploads(img_path, "carousel")
            slide = CarouselSlide(
                title=title,
                subtitle=subtitle,
                image_path=upload_path,
                button_text=btn_text,
                button_link=btn_link,
                order=order,
                is_active=True
            )
            db.add(slide)
            count += 1
    
    db.commit()
    print(f"✓ Imported {count} carousel slides")


def import_services(db: Session):
    """Import service images."""
    services = [
        ("service-1.jpeg", "Batimetriya tədqiqatları", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 0),
        ("service-2.jpeg", "SONAR planaalma", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 1),
        ("service-3.jpeg", "Suda 3D modellərin qurulması", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 2),
        ("service-4.jpg", "Su, sahil və səviyyə ölçmələri", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 3),
        ("service-5.jpg", "Xəritə və modellərin tərtib edilməsi", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 4),
        ("service-6.jpg", "Su obyektlərində dinamik dəyişmə", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 5),
        ("service-id.jpg", "Akustik təsvirlər", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 6),
        ("service-id2.jpg", "Subasma sahələrin müəyyənləşdirilməsi", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 7),
        ("service-id3.jpg", "İnventarizasiya və təsnifat", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem.", 8),
    ]
    
    count = 0
    for img_name, title, description, order in services:
        img_path = IMG_DIR / img_name
        if img_path.exists():
            existing = db.query(Service).filter(Service.image_path.like(f"%{img_name}")).first()
            if existing:
                continue
            
            upload_path = copy_image_to_uploads(img_path, "services")
            service = Service(
                title=title,
                description=description,
                image_path=upload_path,
                order=order,
                is_active=True
            )
            db.add(service)
            count += 1
    
    db.commit()
    print(f"✓ Imported {count} services")


def import_portfolio(db: Session):
    """Import portfolio projects."""
    projects = [
        ("azure1.jpeg", "Port d Azure Layihəsi", "Lorem ipsum dolor sit amet elit. Phasel nec pretium mi. Curabit facilis ornare velit non. Aliqu metus tortor, auctor id gravi condime, viverra quis sem.", ProjectStatus.COMPLETED, 0),
        ("azure2.jpeg", "Port d Azure Layihəsi", "Lorem ipsum dolor sit amet elit. Phasel nec pretium mi. Curabit facilis ornare velit non. Aliqu metus tortor, auctor id gravi condime, viverra quis sem.", ProjectStatus.IN_PROGRESS, 1),
        ("nardaran1.jpeg", "Nardaran İnvest Aypara Layihəsi", "Lorem ipsum dolor sit amet elit. Phasel nec pretium mi. Curabit facilis ornare velit non. Aliqu metus tortor, auctor id gravi condime, viverra quis sem.", ProjectStatus.FUTURE, 2),
        ("portfolio-4.jpg", "Project Name", "Lorem ipsum dolor sit amet elit. Phasel nec pretium mi. Curabit facilis ornare velit non. Aliqu metus tortor, auctor id gravi condime, viverra quis sem.", ProjectStatus.COMPLETED, 3),
        ("portfolio-5.jpg", "Project Name", "Lorem ipsum dolor sit amet elit. Phasel nec pretium mi. Curabit facilis ornare velit non. Aliqu metus tortor, auctor id gravi condime, viverra quis sem.", ProjectStatus.IN_PROGRESS, 4),
        ("portfolio-6.jpg", "Project Name", "Lorem ipsum dolor sit amet elit. Phasel nec pretium mi. Curabit facilis ornare velit non. Aliqu metus tortor, auctor id gravi condime, viverra quis sem.", ProjectStatus.FUTURE, 5),
    ]
    
    count = 0
    for img_name, title, description, status, order in projects:
        img_path = IMG_DIR / img_name
        if img_path.exists():
            existing = db.query(PortfolioProject).filter(PortfolioProject.image_path.like(f"%{img_name}")).first()
            if existing:
                continue
            
            upload_path = copy_image_to_uploads(img_path, "portfolio")
            project = PortfolioProject(
                title=title,
                description=description,
                image_path=upload_path,
                status=status,
                order=order,
                is_active=True
            )
            db.add(project)
            count += 1
    
    db.commit()
    print(f"✓ Imported {count} portfolio projects")


def import_blog_posts(db: Session):
    """Import blog posts."""
    posts = [
        ("azure1.jpeg", "Port d Azure Layihəsi", "Lorem ipsum dolor sit amet elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor", "Admin", "Construction", True),
        ("azure2.jpeg", "Port d Azure Layihəsi", "Lorem ipsum dolor sit amet elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor", "Admin", "Construction", True),
        ("nardaran1.jpeg", "Aypara Layihəsi", "Lorem ipsum dolor sit amet elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor", "Admin", "Construction", True),
    ]
    
    count = 0
    for img_name, title, excerpt, author, category, is_published in posts:
        img_path = IMG_DIR / img_name
        if img_path.exists():
            existing = db.query(BlogPost).filter(BlogPost.image_path.like(f"%{img_name}")).first()
            if existing:
                continue
            
            upload_path = copy_image_to_uploads(img_path, "blog")
            from datetime import datetime, timezone
            post = BlogPost(
                title=title,
                excerpt=excerpt,
                content=excerpt,
                image_path=upload_path,
                author=author,
                category=category,
                is_published=is_published,
                published_at=datetime.now(timezone.utc) if is_published else None
            )
            db.add(post)
            count += 1
    
    db.commit()
    print(f"✓ Imported {count} blog posts")


def import_partners(db: Session):
    """Import partner images."""
    partners = [
        ("kolida.jpeg", "Kolida", None, 0),
    ]
    
    count = 0
    for img_name, name, website_url, order in partners:
        img_path = IMG_DIR / img_name
        if img_path.exists():
            existing = db.query(Partner).filter(Partner.image_path.like(f"%{img_name}")).first()
            if existing:
                continue
            
            upload_path = copy_image_to_uploads(img_path, "partners")
            partner = Partner(
                name=name,
                image_path=upload_path,
                website_url=website_url,
                order=order,
                is_active=True
            )
            db.add(partner)
            count += 1
    
    db.commit()
    print(f"✓ Imported {count} partners")


def import_licenses(db: Session):
    """Import license images."""
    licenses = [
        ("license1.png", "Lisenziya 1", "GeoLine Engineering lisenziyası", 0),
        ("license2.png", "Lisenziya 2", "GeoLine Engineering lisenziyası", 1),
    ]
    
    count = 0
    for img_name, title, description, order in licenses:
        img_path = IMG_DIR / img_name
        if img_path.exists():
            existing = db.query(License).filter(License.image_path.like(f"%{img_name}")).first()
            if existing:
                continue
            
            upload_path = copy_image_to_uploads(img_path, "licenses")
            license = License(
                title=title,
                image_path=upload_path,
                description=description,
                order=order,
                is_active=True
            )
            db.add(license)
            count += 1
    
    db.commit()
    print(f"✓ Imported {count} licenses")


def import_statistics(db: Session):
    """Import statistics."""
    from app.models.statistic import Statistic
    
    stats = [
        ("Peşəkar Heyətimiz", 109, "flaticon-worker", 0),
        ("Xoşbəxt Müştərilərimiz", 485, "flaticon-building", 1),
        ("Bitirilən Layihələr", 789, "flaticon-address", 2),
        ("Aktiv Layihələr", 890, "flaticon-crane", 3),
    ]
    
    count = 0
    for label, value, icon, order in stats:
        existing = db.query(Statistic).filter(Statistic.label == label).first()
        if existing:
            continue
        
        stat = Statistic(
            label=label,
            value=value,
            icon=icon,
            order=order,
            is_active=True
        )
        db.add(stat)
        count += 1
    
    db.commit()
    print(f"✓ Imported {count} statistics")


def import_contact_info(db: Session):
    """Import contact information."""
    from app.models.contact import ContactInfo
    
    contact_info = [
        ("hours", "İş Saatları", "Bazar ertəsi - Şənbə, 9:00 - 18:00", "flaticon-calendar", 0),
        ("phone", "Əlaqə", "+994 55 411 04 54", "flaticon-call", 1),
        ("email", "E-poçt", "geolineazmmc@gmail.com", "flaticon-send-mail", 2),
        ("whatsapp", "WhatsApp", "+994 55 411 04 54", "flaticon-call", 3),
    ]
    
    count = 0
    for info_type, label, value, icon, order in contact_info:
        existing = db.query(ContactInfo).filter(
            ContactInfo.type == info_type,
            ContactInfo.label == label
        ).first()
        if existing:
            continue
        
        info = ContactInfo(
            type=info_type,
            label=label,
            value=value,
            icon=icon,
            order=order,
            is_active=True
        )
        db.add(info)
        count += 1
    
    db.commit()
    print(f"✓ Imported {count} contact info items")


def import_about_content(db: Session):
    """Import about content."""
    from app.models.about import AboutContent
    
    about_img = IMG_DIR / "flametowers.jpg"
    if about_img.exists():
        existing = db.query(AboutContent).first()
        if not existing:
            upload_path = copy_image_to_uploads(about_img, "about")
            about = AboutContent(
                title="25 İllik təcrübə",
                subtitle="GeoLine-a xoş gəlmisiniz",
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec pretium mi. Curabitur facilisis ornare velit non vulputate. Aliquam metus tortor, auctor id gravida condimentum, viverra quis sem. Curabitur non nisl nec nisi scelerisque maximus. Aenean consectetur convallis porttitor. Aliquam interdum at lacus non blandit.",
                image_path=upload_path,
                is_active=True
            )
            db.add(about)
            db.commit()
            print("✓ Imported about content")
        else:
            print("✓ About content already exists")


def main():
    """Main import function."""
    print("Starting image import...")
    print(f"Source directory: {IMG_DIR}")
    print(f"Upload directory: {UPLOAD_DIR}")
    print()
    
    db = SessionLocal()
    try:
        import_carousel_images(db)
        import_services(db)
        import_portfolio(db)
        import_blog_posts(db)
        import_partners(db)
        import_licenses(db)
        import_statistics(db)
        import_contact_info(db)
        import_about_content(db)
        
        print()
        print("✅ Image import completed successfully!")
    except Exception as e:
        print(f"❌ Error during import: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

