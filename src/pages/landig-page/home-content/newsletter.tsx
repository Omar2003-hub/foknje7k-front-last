import React, { useContext, useState } from "react";
import { SnackbarContext } from "../../../config/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEnvelope, faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import CustomButton from "../../../shared/custom-button/custom-button";
import { useNavigate } from "react-router-dom";
import { prof, newsletterOne, newsletterTwo } from "../../../assets/images";
import "./newsletter.css";

const Newsletter = () => {
  const snackbarContext = useContext(SnackbarContext);
  const navigation = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = () => {
    if (email === "") {
      snackbarContext?.showMessage(
        "Abonnez-vous",
        "Veuillez entrer votre email.",
        "error"
      );
      return;
    }
    const regext = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!regext.test(email)) {
      snackbarContext?.showMessage(
        "Abonnez-vous",
        "Veuillez entrer un email valide.",
        "error"
      );
      return;
    }
    snackbarContext?.showMessage(
      "Abonnez-vous",
      "Vous êtes abonné avec succès.",
      "success"
    );
    setEmail("");
  };

  return (
    <div className="newsletter-container" id="contact">
      <div className="newsletter-content">
        <div className="newsletter-left">
          <div className="newsletter-top">
            <div className="title-section">
              <h1 className="newsletter-title">
                Vous souhaitez partager votre connaissance ?
                <br />
                <span className="highlight">Rejoignez-nous comme un Professeur</span>
              </h1>
            </div>
            
            <p className="newsletter-description">
              Rejoignez notre équipe dynamique et enthousiaste de professeurs et
              contribuez à l'épanouissement de la prochaine génération.
            </p>

            <CustomButton
              text={"Rejoignez-nous"}
              width="w-min"
              className="text-nowrap join-btn"
              onClick={() => navigation("/register")}
            />
          </div>
          
          <div className="newsletter-bottom">
            <div className="student-images">
              <div className="student-image-container">
                <img src={newsletterOne} alt="Étudiant" className="student-img" />
                <div className="online-indicator"></div>
              </div>
              <div className="student-image-container">
                <img src={newsletterTwo} alt="Étudiante" className="student-img" />
                <div className="online-indicator"></div>
              </div>
              <div className="student-count">
                <span>900+</span>
                <p>Élèves actifs</p>
              </div>
            </div>
            
            <div className="notification-card">
              <div className="bell-icon">
                <FontAwesomeIcon
                  icon={faBell}
                  shake
                  className="sound-icon"
                />
              </div>
              <div className="notification-text">
                <p>Abonnez-vous pour obtenir une</p>
                <p>mise à jour chaque nouveau cours</p>
              </div>
            </div>
            
            <div className="subscription-info">
              <p>
                Profitez de votre temps libre pour apprendre de nouvelles
                compétences. Plus de 900 étudiants apprennent quotidiennement avec
                FOK NJE7EK. Abonnez-vous pour découvrir nos nouveaux cours.
              </p>
            </div>
          </div>
        </div>
        
        <div className="newsletter-right">
          <div 
            className="teacher-section"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="teacher-image-container">
              <img 
                src={prof} 
                alt="Professeur" 
                className={`teacher-img ${isHovered ? 'hovered' : ''}`}
              />
              <div className="teacher-badge">
                <span>Prof</span>
              </div>
            </div>
          </div>
          
          <div className="subscription-form">
            <h3>Restez informé</h3>
            <p className="form-description">Recevez les dernières actualités et nouveaux cours</p>
            <div className="input-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <input
                type="email"
                placeholder="Entrer votre email"
                className="email-input"
                value={email}
                onChange={handleEmailChange}
              />
              <button
                className="subscribe-button"
                onClick={handleSubscribe}
              >
                Abonnez-vous
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;