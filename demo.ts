export class AA {
  static template =html`
    <div>[[this.bb]]</div>
    <div>[[this.dd]]</div>
    <div>[[this.bb]]</div>
    <input type="checkbox" meta="geht das" .checked="{{this.ee}}" ein-gutiger-attribut-fuer-input="hi" ein-gutiger-attribut-fuer-img="hi" >
    <img type="checkbox" meta="geht  das"  .checked="{{this.ee}}" ein-gutiger-attribut-fuer-input="hi" ein-gutiger-attribut-fuer-img="hi" >
  `;

  static templatef = html`
    <div>[[this.bb]]</div>
    <input type="checkbox" meta="hi" .checked="{{this.ee}}">Value: [[this.ee]]





    <div>[[this.bb]]</div>
  `;
  static style = css`
    :host {
        font-size: 20px;
    }`;



static styleA = css`
    :host {
        font-size: 20px;
    }`;
}
