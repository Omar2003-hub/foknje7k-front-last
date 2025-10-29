import React from "react";
import { Logo } from "../../assets/images";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCircleInfo, 
  faPhone, 
  faEnvelope, 
  faGraduationCap, 
  faPeopleGroup, 
  faLink,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import "./footer.css";
const Footer = () => {
  return (
    <div className="footerContainer w-full shadow-lg	 bg-[#f9f6f1] pt-7 pb-3 px-4 sm:px-6 md:px-12 lg:px-24"  style={{ boxShadow: "0 -8px 15px -4px rgba(0, 0, 0, 0.2)" }}>
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="flex flex-col items-center md:items-start space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <img
                alt="logo"
                src={Logo}
                className="w-20 h-28 lg:w-20 lg:h-20 object-cover rounded-xl  "
              />
              <div>
                <h2 className="text-xl font-bold mt-2 sm:mt-0">FOK NJE7EK</h2>
                <p className="text-sm opacity-80">Apprendre, grandir, réussir</p>
              </div>
            </div>
            
            <div className="space-y-3 w-full">
              <div className="footerContact flex items-center justify-center md:justify-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="fa w-5 text-center text-[#048c6b]" />
                <p className="ml-3">Tunis, Tunisia</p>
              </div>
              <div className="footerContact flex items-center justify-center md:justify-start">
                <FontAwesomeIcon icon={faPhone} className="fa w-5 text-center text-[#048c6b]" />
                <p className="ml-3">+216 51 347 528</p>
              </div>
              <div className="footerContact flex items-center justify-center md:justify-start">
                <FontAwesomeIcon icon={faEnvelope} className="fa w-5 text-center text-[#048c6b]" />
                <p className="ml-3">contact@foknje7ik.com</p>
              </div>
            </div>
            
            <div className="linkss flex space-x-4 pt-2 justify-center md:justify-start">
              <a
                href="https://www.facebook.com/profile.php?id=100069589923551"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FacebookOutlinedIcon className="text-[#1028ff]" style={{ fontSize: 28 }} />
              </a>
              <a
                href="https://www.instagram.com/fok_nje7ik?igsh=eGU5ZWI0cjFmdDBi"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <InstagramIcon className="text-[#f501dd]" style={{ fontSize: 28 }} />
              </a>
              <a
                href="https://youtube.com/@foknje7ik?si=Gx6DuBqwdkokJLUl"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <YouTubeIcon className="text-[#ff1010]" style={{ fontSize: 28 }} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <div className="courses-title flex items-center">
              <FontAwesomeIcon icon={faGraduationCap} className="fa w-5 text-[#048c6b]" />
              <h3 className="font-bold text-lg ml-3">Cours</h3>
            </div>
            <div className="footer-informations space-y-3 mt-4 w-full">
              <p className="footer-link text-center md:text-left">Cours en classroom</p>
              <p className="footer-link text-center md:text-left">Cours E-learning</p>
              <p className="footer-link text-center md:text-left">Cours vidéo</p>
              <p className="footer-link text-center md:text-left">Cours gratuits</p>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <div className="courses-title flex items-center">
              <FontAwesomeIcon icon={faPeopleGroup} className="fa w-5 text-[#048c6b]" />
              <h3 className="font-bold text-lg ml-3">Communauté</h3>
            </div>
            <div className="footer-informations space-y-3 mt-4 w-full">
              <p className="footer-link text-center md:text-left">Apprenants</p>
              <p className="footer-link text-center md:text-left">Partenaires</p>
              <p className="footer-link text-center md:text-left">Blog</p>
              <p className="footer-link text-center md:text-left">Centre d'enseignement</p>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <div className="courses-title flex items-center">
              <FontAwesomeIcon icon={faLink} className="fa w-5 text-[#048c6b]" />
              <h3 className="font-bold text-lg ml-3">Liens rapides</h3>
            </div>
            <div className="footer-informations space-y-3 mt-4 w-full">
              <p className="footer-link text-center md:text-left">Accueil</p>
              <p className="footer-link text-center md:text-left">Education</p>
              <p className="footer-link text-center md:text-left">Admissions</p>
              <p className="footer-link text-center md:text-left">Témoignages</p>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <div className="courses-title flex items-center">
              <FontAwesomeIcon icon={faCircleInfo} className="fa w-5 text-[#048c6b]" />
              <h3 className="font-bold text-lg ml-3">Plus d'infos</h3>
            </div>
            <div className="footer-informations space-y-3 mt-4 w-full">
              <p className="footer-link text-center md:text-left">Termes</p>
              <p className="footer-link text-center md:text-left">Politique de confidentialité</p>
              <p className="footer-link text-center md:text-left">Aide</p>
              <p className="footer-link text-center md:text-left">Contact</p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border/20 flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-sm opacity-80">
            <span className="fa">©</span> 2025 FOK NJE7EK. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <p className="text-sm opacity-80">Conditions d'utilisation</p>
            <p className="text-sm opacity-80">Politique de confidentialité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;