export class Normalize {
    constructor(vmin, vmax, clip=false) {
        this.vmin = vmin;
        this.vmax = vmax;
        this.clip = clip;
    }
    cal(x) {
        if (this.clip) {
            if (x > this.vmax) {
                return 1;
            }
            if (x < this.vmin) {
                return 0;
            }
        }
        return (x-this.vmin)/(this.vmax-this.vmin);
    }
    inverse(x) {
        return this.vmin+x*(this.vmax-this.vmin);
    }
}

export class LogNorm extends Normalize {
    constructor(vmin, vmax, clip=false) {
        super(Math.log(vmin), Math.log(vmax), clip);
    }
    cal(x) {
        if (x < 0) {
            return null
        }
        return super.cal(Math.log(x));
    }
    inverse(x) {
        return Math.exp(super.inverse(x));
    }
}

export class CenteredNorm extends Normalize {
    constructor(vcenter, halfrange, clip=false) {
        super(vcenter-halfrange, vcenter+halfrange, clip);
    }
}

export class SymLogNorm {
    constructor(linthresh, vmin, vmax, linscale=1, vcenter=0, clip=false){
        // (vmin, 0), (vcenter-linthresh, 1/(linscale+1)/2), (vcenter, 1/2), (vcenter+linthresh, 1-1/(linscale+1)/2), (vmax, 1)
        this.vmin = vmin;
        this.linvmin = vcenter-linthresh;
        this.vcenter = vcenter;
        this.linvmax = vcenter+linthresh;
        this.vmax = vmax;
        this.linthresh = linthresh;
        this.linscale = linscale;
        this.length1 = Math.log(this.vcenter-this.vmin)-Math.log(this.vcenter-this.linvmin);
        this.length3 = Math.log(this.vmax-this.vcenter)-Math.log(this.linvmax-this.vcenter);
        this.length2 = (this.length1+this.length3)*this.linscale;
        this.length = this.length1+this.length2+this.length3;
        this.point_linvmin = this.length1/this.length;
        this.point_linvmax = (this.length1+this.length2)/this.length;
        this.clip = clip;
    }
    cal(x) {
        if (this.clip) {
            if (x > this.vmax) {
                return 1;
            }
            if (x < this.vmin) {
                return 0;
            }
        }
        if (Math.abs(x - this.vcenter) < this.linthresh) {
            return this.point_linvmin+new Normalize(this.linvmin, this.linvmax).cal(x)*(this.point_linvmax-this.point_linvmin);
        } else if (x < this.vcenter) {
            return (1-new LogNorm(this.vcenter-this.linvmin, this.vcenter-this.vmin).cal(this.vcenter-x))*(this.point_linvmin);
        } else if (x > this.vcenter) {
            return this.point_linvmax+new LogNorm(this.linvmax-this.vcenter, this.vmax-this.vcenter).cal(x-this.vcenter)*(1-this.point_linvmax);
        }
    }
    inverse(x) {
        if (x < this.point_linvmin) {
            return this.vcenter-new LogNorm(this.vcenter-this.linvmin, this.vcenter-this.vmin).inverse((this.point_linvmin-x)/this.point_linvmin);
        } else if (x < this.point_linvmax) {
            return this.linvmin+new Normalize(this.linvmin, this.linvmax).inverse((x-this.point_linvmin)/(this.point_linvmax-this.point_linvmin));
        } else {
            return this.vcenter+new LogNorm(this.linvmax-this.vcenter, this.vmax-this.vcenter).inverse((x-this.point_linvmax)/(1-this.point_linvmax));
        }
    }
}