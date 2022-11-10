import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;
  map: google.maps.Map;
  minhaposicao: google.maps.LatLng;
  listaEnderecos: any = [];

  private autoCompleate = new google.maps.places.AutocompleteService();
  private directions=new google.maps.DirectionsService();
  private directionsRender=new google.maps.DirectionsRenderer();

  constructor(private geolocation: Geolocation, private ngZone: NgZone) {}
  ionViewWillEnter() {
    this.exibirMapa();
  }
  exibirMapa() {
    const position1 = new google.maps.LatLng(
      -21.762159141604002,
      -41.318149607276936
    );
    const opcoes = {
      center: position1,
      zoom: 1,
      disableDefaultUI: true,
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, opcoes);

    this.minhaPosicao();
  }
  minhaPosicao() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        this.minhaposicao = new google.maps.LatLng(
          resp.coords.latitude,
          resp.coords.longitude
        );
        this.irParaMinhaPosicao();
      })
      .catch((error) => {
        console.log('Error getting location', error);
      });
  }
  irParaMinhaPosicao() {
    this.map.setCenter(this.minhaposicao);
    this.map.setZoom(15);

    const marcador = new google.maps.Marker({
      position: this.minhaposicao,
      map: this.map,
      animation: google.maps.Animation.BOUNCE,
      title: 'minha posição',
    });
  }

  buscarEndereco(eventoCampoBusca: any) {
    const busca = eventoCampoBusca.target.value as string;
    if (!busca.trim().length) {
      this.listaEnderecos = [];
      return false;
    } else {
      this.autoCompleate.getPlacePredictions(
        { input: busca },
        (arrayLocais, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            this.ngZone.run(()=>{
              this.listaEnderecos = arrayLocais;
            });

          } else {
            this.listaEnderecos = [];
          }
        }
      );
    }
  }
  public tracarRota(local: google.maps.places.AutocompletePrediction) {

    new google.maps.Geocoder().geocode({address: local.description},resultado=>{


     const marker=new google.maps.Marker(
      {
        position: resultado[0].geometry.location,
        animation: google.maps.Animation.DROP,
        map: this.map,
        title: resultado[0].formatted_address
      }
     );
    const rota: google.maps.DirectionsRequest =
    {
        origin: this.minhaposicao,
        destination: resultado[0].geometry.location,
        unitSystem: google.maps.UnitSystem.METRIC,
        travelMode: google.maps.TravelMode.DRIVING


    };

     this.directions.route(rota,(resultado1,status)=>{
       if(status==google.maps.DirectionsStatus.OK)
       {


          this.directionsRender.setDirections(resultado1);
          this.directionsRender.setOptions({suppressMarkers: true});
          this.directionsRender.setMap(this.map);
       }

     });

    });
    this.listaEnderecos = [];
  }
}
