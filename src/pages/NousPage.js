import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/nous.css";
import NavbarHome from "../components/NavbarHome";

const Nous = () => {
  return (
    <>
      <NavbarHome />
      <div className="nous-page">
        {/* Hero Section */}
        <div className="nous-hero">
          <Container>
            <Row className="justify-content-center text-center">
              <Col md={10} lg={8}>
                <h1 className="nous-hero-title">Bienvenue chez Stayzy</h1>
                <p className="nous-hero-subtitle">
                  Votre partenaire de confiance pour des séjours inoubliables
                </p>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Notre Histoire */}
        <section className="nous-section nous-histoire">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <div className="nous-image-container">
                  <img
                    src="/images/nous.jpg"
                    alt="L'histoire de Stayzy"
                    className="nous-image rounded-3 shadow"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <h2 className="nous-section-titre">Notre Histoire</h2>
                <div className="nous-section-line"></div>
                <p className="nous-text">
                  Fondée en 2020, Stayzy est née d'une passion partagée pour le
                  voyage et l'hospitalité. Face aux défis du marché de
                  l'hébergement contemporain, nos fondateurs ont imaginé une
                  plateforme qui allie technologie de pointe et chaleur humaine.
                </p>
                <p className="nous-text">
                  Notre mission est de créer des connexions authentiques entre
                  voyageurs et hôtes, tout en simplifiant la gestion des séjours
                  pour tous. Depuis nos débuts, nous avons accompagné plus de 10
                  000 clients dans leur recherche du logement idéal.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Nos Valeurs */}
        <section className="nous-section nous-valeurs">
          <Container>
            <Row className="justify-content-center text-center mb-5">
              <Col lg={8}>
                <h2 className="nous-section-titre">Nos Valeurs</h2>
                <div className="nous-section-line mx-auto"></div>
                <p className="nous-text">
                  Chez Stayzy, nous croyons que les meilleurs voyages sont ceux
                  qui combinent confort, authenticité et fiabilité.
                </p>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-4">
                <div className="nous-valeur-card">
                  <div className="nous-valeur-icon">
                    <i className="fas fa-hand-holding-heart"></i>
                  </div>
                  <h3 className="nous-valeur-titre">Hospitalité</h3>
                  <p className="nous-valeur-texte">
                    Nous mettons tout en œuvre pour que chaque voyageur se sente
                    comme chez lui, peu importe où il se trouve dans le monde.
                  </p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="nous-valeur-card">
                  <div className="nous-valeur-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h3 className="nous-valeur-titre">Fiabilité</h3>
                  <p className="nous-valeur-texte">
                    Notre plateforme garantit des transactions sécurisées et une
                    transparence totale pour tous les utilisateurs.
                  </p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="nous-valeur-card">
                  <div className="nous-valeur-icon">
                    <i className="fas fa-globe-americas"></i>
                  </div>
                  <h3 className="nous-valeur-titre">Durabilité</h3>
                  <p className="nous-valeur-texte">
                    Nous encourageons un tourisme responsable et nous nous
                    engageons à réduire notre empreinte écologique.
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Notre Équipe */}
        <section className="nous-section nous-equipe">
          <Container>
            <Row className="justify-content-center text-center mb-5">
              <Col lg={8}>
                <h2 className="nous-section-titre">Notre Équipe</h2>
                <div className="nous-section-line mx-auto"></div>
                <p className="nous-text">
                  Une équipe passionnée et diversifiée, unie par la volonté de
                  révolutionner l'expérience de voyage.
                </p>
              </Col>
            </Row>
            <Row>
              <Col lg={3} md={6} className="mb-4">
                <div className="nous-membre-card">
                  <div className="nous-membre-img-container">
                    <img
                      src="/images/yesmina.jpg"
                      alt="Membre de l'équipe Stayzy"
                      className="nous-membre-img"
                    />
                  </div>
                  <h4 className="nous-membre-nom">Yessmine Larousse</h4>
                  <p className="nous-membre-poste">Co-fondatrice & CEO</p>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <div className="nous-membre-card">
                  <div className="nous-membre-img-container">
                    <img
                      src="/images/meryouma.jpg"
                      alt="Membre de l'équipe Stayzy"
                      className="nous-membre-img"
                    />
                  </div>
                  <h4 className="nous-membre-nom">Meriam Baklouti</h4>
                  <p className="nous-membre-poste">Co-fondatrice & CTO</p>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <div className="nous-membre-card">
                  <div className="nous-membre-img-container">
                    <img
                      src="/images/ranim.jpg"
                      alt="Membre de l'équipe Stayzy"
                      className="nous-membre-img"
                    />
                  </div>
                  <h4 className="nous-membre-nom">Ranim Doggaz</h4>
                  <p className="nous-membre-poste">Directrice Marketing</p>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <div className="nous-membre-card">
                  <div className="nous-membre-img-container">
                    <img
                      src="/images/cheima.jpg"
                      alt="Membre de l'équipe Stayzy"
                      className="nous-membre-img"
                    />
                  </div>
                  <h4 className="nous-membre-nom">Cheima Doggaz</h4>
                  <p className="nous-membre-poste">Responsable Client</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Notre Approche */}
        <section className="nous-section nous-approche">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="order-lg-2 mb-4 mb-lg-0">
                <div className="nous-image-container">
                  <img
                    src="/images/nous2.jpg"
                    alt="Notre approche"
                    className="nous-image rounded-3 shadow"
                  />
                </div>
              </Col>
              <Col lg={6} className="order-lg-1">
                <h2 className="nous-section-titre">Notre Approche</h2>
                <div className="nous-section-line"></div>
                <p className="nous-text">
                  Chez Stayzy, nous croyons que la technologie doit être au
                  service de l'humain. Notre plateforme utilise l'intelligence
                  artificielle pour personnaliser votre expérience tout en
                  conservant une touche humaine essentielle.
                </p>
                <ul className="nous-list">
                  <li>
                    <i className="fas fa-check-circle nous-list-icon"></i>
                    Des logements vérifiés et de qualité
                  </li>
                  <li>
                    <i className="fas fa-check-circle nous-list-icon"></i>
                    Un système de réservation transparent et sécurisé
                  </li>
                  <li>
                    <i className="fas fa-check-circle nous-list-icon"></i>
                    Un support client disponible 24/7
                  </li>
                  <li>
                    <i className="fas fa-check-circle nous-list-icon"></i>
                    Des conseils de voyage personnalisés
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Témoignages */}
        <section className="nous-section nous-temoignages">
          <Container>
            <Row className="justify-content-center text-center mb-5">
              <Col lg={8}>
                <h2 className="nous-section-titre">
                  Ce Que Disent Nos Clients
                </h2>
                <div className="nous-section-line mx-auto"></div>
              </Col>
            </Row>
            <Row>
              <Col md={6} lg={4} className="mb-4">
                <div className="nous-temoignage-card">
                  <div className="nous-temoignage-stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <p className="nous-temoignage-texte">
                    "Stayzy m'a permis de trouver l'appartement parfait pour mes
                    vacances à Paris. Le processus était simple et l'assistance
                    client extraordinaire."
                  </p>
                  <div className="nous-temoignage-auteur">
                    <img
                      src="/images/testimonial-1.jpg"
                      alt="Client Stayzy"
                      className="nous-temoignage-img"
                    />
                    <div>
                      <h5 className="nous-temoignage-nom">Marie L.</h5>
                      <p className="nous-temoignage-ville">Lyon, France</p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6} lg={4} className="mb-4">
                <div className="nous-temoignage-card">
                  <div className="nous-temoignage-stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <p className="nous-temoignage-texte">
                    "En tant que propriétaire, j'apprécie la simplicité de
                    gestion et la sécurité des paiements. Stayzy a transformé ma
                    façon de gérer ma location."
                  </p>
                  <div className="nous-temoignage-auteur">
                    <img
                      src="/images/testimonial-2.jpg"
                      alt="Client Stayzy"
                      className="nous-temoignage-img"
                    />
                    <div>
                      <h5 className="nous-temoignage-nom">Pierre T.</h5>
                      <p className="nous-temoignage-ville">Bordeaux, France</p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6} lg={4} className="mb-4 mx-auto">
                <div className="nous-temoignage-card">
                  <div className="nous-temoignage-stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                  <p className="nous-temoignage-texte">
                    "J'ai découvert des logements uniques que je n'aurais jamais
                    trouvés ailleurs. L'application est intuitive et les
                    recommandations sont toujours pertinentes."
                  </p>
                  <div className="nous-temoignage-auteur">
                    <img
                      src="/images/testimonial-3.jpg"
                      alt="Client Stayzy"
                      className="nous-temoignage-img"
                    />
                    <div>
                      <h5 className="nous-temoignage-nom">Julie R.</h5>
                      <p className="nous-temoignage-ville">Marseille, France</p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="nous-section nous-cta">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <h2 className="nous-cta-titre">Prêt à Voyager avec Stayzy?</h2>
                <p className="nous-cta-texte">
                  Rejoignez notre communauté de voyageurs et hôtes passionnés.
                  Votre prochaine aventure commence ici.
                </p>
                <div className="nous-cta-buttons">
                  <a href="/register" className="btn btn-primary nous-cta-btn">
                    S'inscrire
                  </a>
                  <a
                    href="/login"
                    className="btn btn-outline-light nous-cta-btn-secondary"
                  >
                    Se connecter
                  </a>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default Nous;
