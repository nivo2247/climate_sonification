const CMajor = 'C D E F G A B,';
const CHarmonic = 'C D Eb F G Ab B,';
const CPhrygiDorian = 'C Db Eb F G A Bb,';
const CPhrygiDominant = 'C Db E F G Ab Bb,';
const CDoubleHarmonic = 'C Db E F G Ab B,';

const toFullScale = scaleString => scaleString.repeat(6) // adds octaves
                                                .split(',') // splits by octave
                                                .map(row => row ? row.split(' ') : ['C']) // adds final note
                                                .map((row, idx) => row.map(r => `${r}${idx + 2}`).join(' ')) // adds octave numbers
                                                .join(' ').split(' '); // flattens array

// these scales can be permuted if necessary to give
// the intruments less note overlap
export const SCALES = {
    'maj': toFullScale(CMajor),
    'harm': toFullScale(CHarmonic),
    'pdor': toFullScale(CPhrygiDorian),
    'pdom': toFullScale(CPhrygiDominant),
    'dharm': toFullScale(CDoubleHarmonic)
}

/*
These indices correspond more or less to breaking up the range of CO2 values into
5 evenly spaces increments.  Because CO2 builds non-linearly, the indices are not
evenly spaced.  I had them switch out of major harmonic a little early because the majority
of the simulation is already in major, and I think we're looking for a little more
variety.

I didn't want to change this too much though, because most of CO2 increases are happening later
on and it seems important to communicate that.
*/
export const getScale = idx => {
    if(idx < 104) {
        return 'maj';
    } else if(idx < 130) {
        return 'harm';
    } else if(idx < 152) {
        return 'pdor';
    } else if(idx < 166) {
        return 'pdom';
    } else {
        return 'dharm';
    }
}
